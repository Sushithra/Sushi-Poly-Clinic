import crypto from 'crypto';
import Razorpay from 'razorpay';
import mongoose from 'mongoose';
import Order from '../models/Order.model.js';
import Cart from '../models/Cart.model.js';
import Product from '../models/Product.js';

// Reuses the same Razorpay configuration (env keys, SDK client) as the
// appointment payment flow. See controllers/payment.controller.js.
const getRazorpayClient = () => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    return null;
  }

  return new Razorpay({ key_id, key_secret });
};

// Razorpay only. The backend computes the authoritative total from the
// authenticated user's cart; any amount sent by the frontend is ignored.
// The cart amount is re-derived from stored prices (which were snapshotted
// from the Product at add-to-cart time) so a client cannot alter it.
const getCartSnapshot = async (userId) => {
  const cart = await Cart.findOne({ user: userId });
  if (!cart || cart.items.length === 0) {
    return null;
  }

  const items = [];
  let totalAmount = 0;
  for (const item of cart.items) {
    const product = await Product.findById(item.product);
    totalAmount += Number(item.price) * Number(item.quantity);
    items.push({
      product: item.product,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
      prescriptionRequired: item.prescriptionRequired,
      productStock: product ? Number(product.stock) : 0,
    });
  }

  return { cart, items, totalAmount };
};

const itemsFingerprint = (items) =>
  items
    .map((i) => `${i.product}:${i.quantity}`)
    .sort()
    .join('|');

// Create a pending Pharmacy order + Razorpay order. Reuses the pending order
// when a retry submits an identical cart, so retries don't create duplicates.
export const createRazorpayOrder = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database is not connected' });
    }

    const { shippingAddress, currency = 'INR', receipt } = req.body;

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone ||
        !shippingAddress.addressLine1 || !shippingAddress.city ||
        !shippingAddress.state || !shippingAddress.pincode) {
      return res.status(400).json({ message: 'Complete shipping address is required' });
    }

    const snapshot = await getCartSnapshot(req.user._id);
    if (!snapshot) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    for (const item of snapshot.items) {
      if (item.productStock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for "${item.name}"` });
      }
    }

    // Authoritative amount in paise (INR).
    const amountInPaise = Math.round(snapshot.totalAmount * 100);
    if (!Number.isInteger(amountInPaise) || amountInPaise < 100) {
      return res.status(400).json({ message: 'Invalid cart amount' });
    }

    const fingerprint = itemsFingerprint(snapshot.items);

    // Reuse an identical, still-unpaid pending order to avoid duplicates.
    let order = await Order.findOne({
      user: req.user._id,
      paymentStatus: 'pending',
      paymentFingerprint: fingerprint,
      orderStatus: { $nin: ['cancelled'] },
    });

    if (!order) {
      order = await Order.create({
        user: req.user._id,
        items: snapshot.items.map((i) => ({
          product: i.product,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          image: i.image,
          prescriptionRequired: i.prescriptionRequired,
        })),
        shippingAddress,
        totalAmount: snapshot.totalAmount,
        paymentMethod: 'razorpay',
        paymentStatus: 'pending',
        razorpayPaymentStatus: 'created',
        paymentFingerprint: fingerprint,
      });
    }

    const razorpay = getRazorpayClient();
    if (!razorpay) {
      return res.status(500).json({ message: 'Razorpay credentials are not configured' });
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency,
      receipt: receipt || `pharmacy_order_${order._id}`,
      notes: {
        orderId: String(order._id),
        userId: String(req.user._id),
      },
    });

    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    return res.status(201).json({
      orderId: order._id,
      order_id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      receipt: razorpayOrder.receipt,
    });
  } catch (error) {
    if (error?.statusCode === 401) {
      return res.status(401).json({
        message: error?.error?.description || error?.description || 'Razorpay authentication failed',
      });
    }
    console.error('Razorpay pharmacy create order error:', error);
    return res.status(500).json({ message: 'Failed to create Razorpay order' });
  }
};

// Verify Razorpay signature server-side, then finalize the order exactly once.
export const verifyPayment = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database is not connected' });
    }

    const {
      orderId,
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
    } = req.body;

    if (!orderId || !razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return res.status(400).json({ message: 'Missing payment verification fields' });
    }

    const order = await Order.findOne({ _id: orderId, user: req.user._id });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.razorpayOrderId && order.razorpayOrderId !== razorpay_order_id) {
      return res.status(400).json({ message: 'Order mismatch' });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return res.status(500).json({ message: 'Razorpay credentials are not configured' });
    }

    const generatedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const generatedBuffer = Buffer.from(generatedSignature, 'hex');
    const receivedBuffer = Buffer.from(String(razorpay_signature), 'hex');

    if (
      generatedBuffer.length !== receivedBuffer.length ||
      !crypto.timingSafeEqual(generatedBuffer, receivedBuffer)
    ) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    // Finalize only once. If already paid, return early WITHOUT re-decrementing
    // stock or re-clearing the cart, so retries can't double-apply.
    const wasUnpaid = order.paymentStatus !== 'paid';

    order.paymentStatus = 'paid';
    order.paymentMethod = 'razorpay';
    order.paymentReference = razorpay_payment_id;
    order.paymentCompletedAt = new Date();
    order.razorpayOrderId = razorpay_order_id;
    order.razorpayPaymentId = razorpay_payment_id;
    order.razorpaySignature = razorpay_signature;
    order.razorpayPaymentStatus = 'paid';

    if (wasUnpaid) {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.quantity },
        });
      }
      const cart = await Cart.findOne({ user: req.user._id });
      if (cart) {
        cart.items = [];
        cart.totalAmount = 0;
        await cart.save();
      }
    }

    await order.save();

    return res.json({ success: true, message: 'Payment verified successfully', order });
  } catch (error) {
    console.error('Razorpay pharmacy verify error:', error);
    return res.status(500).json({ message: 'Failed to verify payment' });
  }
};

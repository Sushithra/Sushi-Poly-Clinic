import crypto from 'crypto';
import Razorpay from 'razorpay';
import mongoose from 'mongoose';
import Appointment from '../models/Appointment.js';
import { getConsultationWindow, parseAppointmentDateTime } from '../services/appointmentTiming.js';

const CONSULTATION_WINDOW_BEFORE_MINUTES = 1;
const CONSULTATION_WINDOW_AFTER_MINUTES = 240;

const getRazorpayClient = () => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    return null;
  }

  return new Razorpay({ key_id, key_secret });
};

const buildConsultationRoomName = () => `eclinic-${crypto.randomBytes(16).toString('hex')}`;

const ensureConsultationRoom = async (appointment) => {
  if (appointment.consultationRoomName) {
    return appointment;
  }

  const appointmentDateTime = parseAppointmentDateTime(appointment.date, appointment.timeSlot);
  const { startsAt, endsAt } = getConsultationWindow(
    appointmentDateTime,
    CONSULTATION_WINDOW_BEFORE_MINUTES,
    CONSULTATION_WINDOW_AFTER_MINUTES,
  );

  appointment.consultationProvider = appointment.consultationProvider || 'webrtc';
  appointment.consultationRoomName = buildConsultationRoomName();
  appointment.consultationRoomCreatedAt = new Date();
  appointment.consultationReadyAt = startsAt;
  appointment.consultationExpiresAt = endsAt;
  return appointment.save();
};

const buildConsultationResponse = (appointment) => {
  const appointmentDateTime = parseAppointmentDateTime(appointment.date, appointment.timeSlot);
  const { startsAt, endsAt } = getConsultationWindow(
    appointmentDateTime,
    CONSULTATION_WINDOW_BEFORE_MINUTES,
    CONSULTATION_WINDOW_AFTER_MINUTES,
  );
  const now = new Date();
  const paymentDue = appointment.paymentStatus !== 'paid';
  const isTooEarly = startsAt ? now.getTime() < startsAt.getTime() : true;
  const isExpired = endsAt ? now.getTime() > endsAt.getTime() : false;
  const canJoin = !paymentDue && !isTooEarly && !isExpired;
  const roomName = appointment.consultationRoomName || '';

  return {
    appointmentId: appointment._id,
    paymentStatus: appointment.paymentStatus,
    consultationProvider: appointment.consultationProvider || 'webrtc',
    consultationRoomName: roomName,
    consultationJoinUrl: '',
    startsAt,
    endsAt,
    canJoin,
    isTooEarly,
    isExpired,
    paymentDue,
  };
};

export const createRazorpayOrder = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database is not connected' });
    }

    const { appointmentId, amount, currency = 'INR', receipt } = req.body;

    if (!appointmentId || !amount || !receipt) {
      return res.status(400).json({ message: 'appointmentId, amount, and receipt are required' });
    }

    const amountInPaise = Number(amount);
    if (!Number.isInteger(amountInPaise) || amountInPaise < 100) {
      return res.status(400).json({ message: 'Amount must be at least 100 paise' });
    }

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      patient: req.user._id,
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointment.status === 'cancelled') {
      return res.status(400).json({ message: 'Cancelled appointments cannot be paid for' });
    }

    if (appointment.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'Appointment is already paid' });
    }

    const razorpay = getRazorpayClient();
    if (!razorpay) {
      return res.status(500).json({ message: 'Razorpay credentials are not configured' });
    }

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency,
      receipt,
      notes: {
        appointmentId: String(appointment._id),
        patientId: String(req.user._id),
      },
    });

    appointment.razorpayOrderId = order.id;
    await appointment.save();

    return res.status(201).json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
    });
  } catch (error) {
    if (error?.statusCode === 401) {
      return res.status(401).json({
        message: error?.error?.description || error?.description || 'Razorpay authentication failed',
      });
    }

    console.error('Razorpay create order error:', error);
    return res.status(500).json({ message: 'Failed to create Razorpay order' });
  }
};

export const verifyRazorpayPayment = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database is not connected' });
    }

    const {
      appointmentId,
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
    } = req.body;

    if (!appointmentId || !razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return res.status(400).json({ message: 'Missing payment verification fields' });
    }

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      patient: req.user._id,
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointment.razorpayOrderId && appointment.razorpayOrderId !== razorpay_order_id) {
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

    appointment.paymentStatus = 'paid';
    appointment.paymentMethod = 'razorpay';
    appointment.paymentReference = razorpay_payment_id;
    appointment.paymentCompletedAt = new Date();
    appointment.razorpayOrderId = razorpay_order_id;
    appointment.razorpayPaymentId = razorpay_payment_id;
    appointment.razorpaySignature = razorpay_signature;
    appointment.razorpayVerifiedAt = new Date();

    const savedAppointment = await appointment.save();
    const consultationReadyAppointment = await ensureConsultationRoom(savedAppointment);
    const consultation = buildConsultationResponse(consultationReadyAppointment);

    return res.json({
      success: true,
      message: 'Payment verified successfully',
      appointment: consultationReadyAppointment,
      consultation,
    });
  } catch (error) {
    console.error('Razorpay verify error:', error);
    return res.status(500).json({ message: 'Failed to verify payment' });
  }
};

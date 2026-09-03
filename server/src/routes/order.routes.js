import express from 'express';
import { getMyOrders, getAllOrders, getOrderById, updateOrderStatus } from '../controllers/order.controller.js';
import { createRazorpayOrder, verifyPayment } from '../controllers/orderPayment.controller.js';
import { protect, authorizeRoles } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getMyOrders);

router.post('/create-razorpay-order', createRazorpayOrder);
router.post('/verify-payment', verifyPayment);

router.route('/all')
  .get(authorizeRoles('doctor', 'admin'), getAllOrders);

router.route('/:id')
  .get(getOrderById);

router.route('/:id/status')
  .patch(authorizeRoles('doctor', 'admin'), updateOrderStatus);

export default router;

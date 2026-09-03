import express from 'express';
import { createOrder, getMyOrders, getAllOrders, getOrderById, updateOrderStatus } from '../controllers/order.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .post(createOrder)
  .get(getMyOrders);

router.route('/all')
  .get(getAllOrders);

router.route('/:id')
  .get(getOrderById);

router.route('/:id/status')
  .patch(updateOrderStatus);

export default router;

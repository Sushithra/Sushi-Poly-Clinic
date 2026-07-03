import express from 'express';
import {
  bookAppointment,
  getMyAppointments,
  getDoctorAppointments,
  confirmAppointment,
  getAppointmentById,
  completeAppointmentPayment,
  getConsultationAccess,
} from '../controllers/appointment.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', protect, bookAppointment);
router.get('/myappointments', protect, getMyAppointments);
router.get('/doctorappointments', protect, getDoctorAppointments);
router.get('/:id', protect, getAppointmentById);
router.post('/:id/pay', protect, completeAppointmentPayment);
router.get('/:id/consultation-access', protect, getConsultationAccess);
router.patch('/:id/confirm', protect, confirmAppointment);

export default router;

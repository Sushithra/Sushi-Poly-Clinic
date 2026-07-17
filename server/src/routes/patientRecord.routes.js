import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import {
  createPatientRecord,
  getMyPatientRecords,
  getDoctorPatients,
  getDoctorPatientDetails,
  deletePatientRecord,
  uploadPatientRecordMiddleware,
} from '../controllers/patientRecord.controller.js';

const router = express.Router();

router.post('/', protect, uploadPatientRecordMiddleware, createPatientRecord);
router.get('/me', protect, getMyPatientRecords);
router.delete('/:id', protect, deletePatientRecord);
router.get('/doctor/patients', protect, getDoctorPatients);
router.get('/doctor/patients/:patientId', protect, getDoctorPatientDetails);

export default router;

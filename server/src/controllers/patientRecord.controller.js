import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import multer from 'multer';
import cloudinary, { isCloudinaryConfigured } from '../config/cloudinary.js';
import Appointment from '../models/Appointment.js';
import PatientRecord from '../models/PatientRecord.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

const upload = multer({ storage: multer.memoryStorage() });

const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']);
const uploadDir = path.resolve(process.cwd(), 'server', 'uploads');

const uploadBufferToCloudinary = (buffer, options = {}) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'eclinic_records', resource_type: 'auto', ...options },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      },
    );
    stream.end(buffer);
  });

const saveBufferLocally = async (file) => {
  await fs.mkdir(uploadDir, { recursive: true });
  const safeName = String(file.originalname || 'record').replace(/[^a-z0-9._-]/gi, '_');
  const fileName = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}-${safeName}`;
  const filePath = path.join(uploadDir, fileName);
  await fs.writeFile(filePath, file.buffer);
  return {
    secure_url: `${process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 5000}`}/uploads/${fileName}`,
    public_id: fileName,
  };
};

const deleteLocalRecordFile = async (fileUrl = '', publicId = '') => {
  const fileName = publicId || path.basename(String(fileUrl || ''));
  if (!fileName) return;

  const filePath = path.join(uploadDir, fileName);
  try {
    await fs.unlink(filePath);
  } catch {
    // ignore missing local file
  }
};

const hasCompletedMeeting = async (doctorId, patientId) =>
  Appointment.exists({
    doctor: doctorId,
    patient: patientId,
    status: 'completed',
  });

export const uploadPatientRecordMiddleware = upload.single('file');

export const createPatientRecord = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database is not connected' });
    }

    if (req.user?.role !== 'patient') {
      return res.status(403).json({ message: 'Only patients can upload records' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    if (!allowedMimeTypes.has(req.file.mimetype)) {
      return res.status(400).json({ message: 'Only image files or PDFs are allowed' });
    }

    const title = String(req.body?.title || req.file.originalname || 'Patient record').trim();
    const notes = String(req.body?.notes || '').trim();
    const appointmentId = String(req.body?.appointmentId || '').trim();

    if (appointmentId) {
      const appointment = await Appointment.findOne({ _id: appointmentId, patient: req.user._id });
      if (!appointment) {
        return res.status(404).json({ message: 'Appointment not found' });
      }
    }

    const uploadResult = isCloudinaryConfigured()
      ? await uploadBufferToCloudinary(req.file.buffer, { public_id: undefined })
      : await saveBufferLocally(req.file);

    const record = await PatientRecord.create({
      patient: req.user._id,
      uploadedBy: req.user._id,
      appointment: appointmentId || null,
      title,
      fileUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      fileName: req.file.originalname || title,
      mimeType: req.file.mimetype,
      fileSize: req.file.size || 0,
      notes,
      storageType: isCloudinaryConfigured() ? 'cloudinary' : 'local',
    });

    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyPatientRecords = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database is not connected' });
    }

    if (req.user?.role !== 'patient') {
      return res.status(403).json({ message: 'Only patients can view their records here' });
    }

    const records = await PatientRecord.find({ patient: req.user._id }).sort({ createdAt: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDoctorPatients = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database is not connected' });
    }

    if (req.user?.role !== 'doctor') {
      return res.status(403).json({ message: 'Only doctors can access this page' });
    }

    const meetings = await Appointment.find({
      doctor: req.user._id,
      status: 'completed',
    })
      .populate({
        path: 'patient',
        select: 'name email phone profilePicture',
      })
      .sort({ consultationCompletedAt: -1, updatedAt: -1 });

    const patientIds = [...new Set(meetings.map((meeting) => String(meeting.patient?._id || meeting.patient)).filter(Boolean))];
    const records = patientIds.length
      ? await PatientRecord.find({ patient: { $in: patientIds } }).sort({ createdAt: -1 })
      : [];

    const recordCountByPatient = records.reduce((acc, record) => {
      const key = String(record.patient);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const patients = meetings.reduce((acc, meeting) => {
      const patient = meeting.patient;
      if (!patient) return acc;

      const id = String(patient._id);
      if (acc.has(id)) return acc;

      acc.set(id, {
        _id: id,
        name: patient.name || 'Patient',
        email: patient.email || '',
        phone: patient.phone || '',
        profilePicture: patient.profilePicture || '',
        completedMeetings: meetings.filter((item) => String(item.patient?._id || item.patient) === id).length,
        lastMeetingAt: meeting.consultationCompletedAt || meeting.updatedAt || meeting.date,
        recordCount: recordCountByPatient[id] || 0,
      });
      return acc;
    }, new Map());

    res.json([...patients.values()]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDoctorPatientDetails = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database is not connected' });
    }

    if (req.user?.role !== 'doctor') {
      return res.status(403).json({ message: 'Only doctors can access this page' });
    }

    const patientId = req.params.patientId;
    const completedMeeting = await Appointment.exists({
      doctor: req.user._id,
      patient: patientId,
      status: 'completed',
    });

    if (!completedMeeting) {
      return res.status(403).json({ message: 'You can only view records after a completed meeting' });
    }

    const [patient, meetings, records] = await Promise.all([
      User.findById(patientId).select('name email phone profilePicture role'),
      Appointment.find({
        doctor: req.user._id,
        patient: patientId,
      })
        .sort({ date: -1, timeSlot: -1 })
        .select('date timeSlot status complaint reason cancellationReason paymentStatus consultationCompletedAt consultationNotes'),
      PatientRecord.find({ patient: patientId }).sort({ createdAt: -1 }),
    ]);

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.json({
      patient: {
        _id: patient._id,
        name: patient.name || 'Patient',
        email: patient.email || '',
        phone: patient.phone || '',
        profilePicture: patient.profilePicture || '',
      },
      meetings,
      records,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deletePatientRecord = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database is not connected' });
    }

    if (req.user?.role !== 'patient') {
      return res.status(403).json({ message: 'Only patients can delete their records' });
    }

    const record = await PatientRecord.findOneAndDelete({
      _id: req.params.id,
      patient: req.user._id,
    });

    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }

    if (record.storageType !== 'cloudinary') {
      await deleteLocalRecordFile(record.fileUrl, record.publicId);
    }

    res.json({ message: 'Record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

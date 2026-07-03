import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';
import crypto from 'crypto';
import { parseAppointmentDateTime, getReminderTime, getConsultationWindow } from '../services/appointmentTiming.js';
import { queueAppointmentConfirmation, queueAppointmentReceipt, queueAppointmentReminder } from '../services/notification.service.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

const CONSULTATION_WINDOW_BEFORE_MINUTES = 1;
const CONSULTATION_WINDOW_AFTER_MINUTES = 240;

const toObjectIdString = (value) => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value._id) {
    return String(value._id);
  }
  return String(value);
};

const isAppointmentParticipant = (appointment, userId) => {
  const requestedUserId = toObjectIdString(userId);
  return requestedUserId && (toObjectIdString(appointment.patient) === requestedUserId || toObjectIdString(appointment.doctor) === requestedUserId);
};

const buildConsultationRoomName = () => {
  const suffix = crypto.randomBytes(16).toString('hex');
  return `eclinic-${suffix}`;
};

const getConsultationState = (appointment) => {
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

  return {
    appointmentDateTime,
    startsAt,
    endsAt,
    canJoin,
    isTooEarly,
    isExpired,
    paymentDue,
  };
};

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

const buildAccessResponse = (appointment) => {
  const consultationState = getConsultationState(appointment);
  const roomName = appointment.consultationRoomName || '';
  return {
    appointmentId: appointment._id,
    paymentStatus: appointment.paymentStatus,
    consultationProvider: appointment.consultationProvider || 'webrtc',
    consultationRoomName: roomName,
    consultationJoinUrl: '',
    startsAt: consultationState.startsAt,
    endsAt: consultationState.endsAt,
    canJoin: consultationState.canJoin,
    isTooEarly: consultationState.isTooEarly,
    isExpired: consultationState.isExpired,
    paymentDue: consultationState.paymentDue,
  };
};

// @desc    Create new appointment
// @route   POST /api/appointments
// @access  Private
export const bookAppointment = async (req, res) => {
  try {
    const { doctorId, doctorName, doctorSpecialty, date, timeSlot, complaint, reason, specialty } = req.body;

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database is not connected' });
    }

    const doctor = await User.findOne({ _id: doctorId, role: 'doctor' }).select('name specializations');

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const resolvedDoctorName = doctorName || doctor.name;
    const resolvedDoctorSpecialty =
      doctorSpecialty ||
      specialty ||
      (Array.isArray(doctor.specializations) && doctor.specializations.length > 0
        ? doctor.specializations.join(', ')
        : 'General Physician');

    const appointmentDateTime = parseAppointmentDateTime(date, timeSlot);
    if (!appointmentDateTime) {
      return res.status(400).json({ message: 'Invalid appointment date or time slot' });
    }

    // Check if slot is already booked
    const existingAppointment = await Appointment.findOne({
      doctor: doctorId,
      date,
      timeSlot,
      status: { $ne: 'cancelled' }
    });

    if (existingAppointment) {
      return res.status(400).json({ message: 'Time slot is already booked' });
    }

    const appointment = new Appointment({
      patient: req.user._id,
      doctor: doctorId,
      doctorName: resolvedDoctorName,
      doctorSpecialty: resolvedDoctorSpecialty,
      patientName: req.user.name,
      patientEmail: req.user.email,
      patientPhone: req.user.phone || '',
      date,
      timeSlot,
      reason: complaint || reason,
      complaint: complaint || reason || '',
      paymentStatus: 'pending',
      paymentMethod: '',
      paymentReference: '',
      paymentCompletedAt: null,
      consultationProvider: 'webrtc',
      consultationRoomName: '',
      consultationRoomCreatedAt: null,
      consultationReadyAt: null,
      consultationExpiresAt: null,
    });

    const createdAppointment = await appointment.save();

    await queueAppointmentReceipt({
      doctorUserId: doctor._id,
      appointmentId: createdAppointment._id,
      patientName: req.user.name,
      dateLabel: appointmentDateTime.toLocaleDateString(),
      timeSlot,
    });

    res.status(201).json(createdAppointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get patient appointments
// @route   GET /api/appointments/myappointments
// @access  Private
export const getMyAppointments = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database is not connected' });
    }

    const appointments = await Appointment.find({ patient: req.user._id })
      .populate({
        path: 'doctor',
        select: 'name email specializations profilePicture'
      })
      .sort({ date: 1 });

    const normalizedAppointments = await Promise.all(
      appointments.map(async (appointment) => {
        const appointmentObject = appointment.toObject();

        if (!appointmentObject.doctorName || appointmentObject.doctorName === 'Doctor') {
          const legacyDoctorId = appointmentObject.doctor?._id || appointmentObject.doctor;

          if (legacyDoctorId) {
            const legacyDoctor = await Doctor.findById(legacyDoctorId)
              .populate('userId', 'name email profilePicture phone');

            if (legacyDoctor) {
              appointmentObject.doctorName =
                legacyDoctor.userId?.name ||
                appointmentObject.doctorName ||
                'Doctor';
              appointmentObject.doctorSpecialty =
                legacyDoctor.specialty ||
                appointmentObject.doctorSpecialty ||
                'General Physician';
            }
          }
        }

        appointmentObject.doctorName =
          appointmentObject.doctorName ||
          appointmentObject.doctor?.name ||
          'Doctor';

        appointmentObject.doctorSpecialty =
          appointmentObject.doctorSpecialty ||
          (Array.isArray(appointmentObject.doctor?.specializations) && appointmentObject.doctor.specializations.length > 0
            ? appointmentObject.doctor.specializations.join(', ')
            : 'General Physician');

        if (appointmentObject.status === 'cancelled' && !appointmentObject.cancellationReason) {
          appointmentObject.cancellationReason = 'Doctor is no longer available';
        }

        return appointmentObject;
      }),
    );

    res.json(normalizedAppointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get doctor appointments
// @route   GET /api/appointments/doctorappointments
// @access  Private
export const getDoctorAppointments = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database is not connected' });
    }

    const appointments = await Appointment.find({ doctor: req.user._id })
      .populate({
        path: 'patient',
        select: 'name email phone profilePicture',
      })
      .sort({ date: 1, timeSlot: 1 });

    const orphanedAppointmentIds = appointments
      .filter((appointment) => !appointment.patient)
      .map((appointment) => appointment._id);

    if (orphanedAppointmentIds.length > 0) {
      await Appointment.deleteMany({ _id: { $in: orphanedAppointmentIds } });
    }

    const normalized = appointments
      .filter((appointment) => appointment.patient)
      .map((appointment) => {
      const object = appointment.toObject();
      return {
        ...object,
        patientName: object.patientName || object.patient?.name || 'Patient',
        patientEmail: object.patientEmail || object.patient?.email || '',
        patientPhone: object.patientPhone || object.patient?.phone || '',
        complaint: object.complaint || object.reason || '',
        cancellationReason: object.cancellationReason || '',
      };
    });

    res.json(normalized);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single appointment for the booked patient or assigned doctor
// @route   GET /api/appointments/:id
// @access  Private
export const getAppointmentById = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database is not connected' });
    }

    const appointment = await Appointment.findById(req.params.id)
      .populate({
        path: 'doctor',
        select: 'name email specializations profilePicture consultationFee',
      })
      .populate({
        path: 'patient',
        select: 'name email phone profilePicture',
      });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (!isAppointmentParticipant(appointment, req.user._id)) {
      return res.status(403).json({ message: 'You are not authorized to view this appointment' });
    }

    const object = appointment.toObject();
    object.doctorName = object.doctorName || object.doctor?.name || 'Doctor';
    object.doctorSpecialty =
      object.doctorSpecialty ||
      (Array.isArray(object.doctor?.specializations) && object.doctor.specializations.length > 0
        ? object.doctor.specializations.join(', ')
        : 'General Physician');
    object.patientName = object.patientName || object.patient?.name || 'Patient';
    object.patientEmail = object.patientEmail || object.patient?.email || '';
    object.patientPhone = object.patientPhone || object.patient?.phone || '';

    res.json(object);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Confirm doctor appointment
// @route   PATCH /api/appointments/:id/confirm
// @access  Private
export const confirmAppointment = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database is not connected' });
    }

    const appointment = await Appointment.findOne({
      _id: req.params.id,
      doctor: req.user._id,
    }).populate({
      path: 'doctor',
      select: 'name email specializations',
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (!appointment.doctorName) {
      appointment.doctorName = appointment.doctor?.name || req.user.name || 'Doctor';
    }

    if (!appointment.doctorSpecialty) {
      appointment.doctorSpecialty =
        Array.isArray(appointment.doctor?.specializations) && appointment.doctor.specializations.length > 0
          ? appointment.doctor.specializations.join(', ')
          : 'General Physician';
    }

    appointment.status = 'confirmed';
    const updated = await appointment.save();

    const appointmentDateTime = parseAppointmentDateTime(appointment.date, appointment.timeSlot);
    const reminderTime = getReminderTime(appointmentDateTime, 5);

    await queueAppointmentConfirmation({
      patientUserId: appointment.patient,
      appointmentId: appointment._id,
      doctorName: appointment.doctorName || appointment.doctor?.name || 'Doctor',
      dateLabel: appointmentDateTime ? appointmentDateTime.toLocaleDateString() : 'your appointment day',
      timeSlot: appointment.timeSlot,
    });

    await queueAppointmentReminder({
      user: appointment.patient,
      appointment: appointment._id,
      role: 'patient',
      reminderTime,
      doctorName: appointment.doctorName || appointment.doctor?.name || 'Doctor',
      patientName: appointment.patientName || req.user.name || 'Patient',
      timeSlot: appointment.timeSlot,
      minutesBefore: 5,
    });

    await queueAppointmentReminder({
      user: appointment.doctor,
      appointment: appointment._id,
      role: 'doctor',
      reminderTime,
      doctorName: appointment.doctorName || req.user.name || 'Doctor',
      patientName: appointment.patientName || 'Patient',
      timeSlot: appointment.timeSlot,
      minutesBefore: 5,
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark appointment payment complete and generate consultation room
// @route   POST /api/appointments/:id/pay
// @access  Private
export const completeAppointmentPayment = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database is not connected' });
    }

    const appointment = await Appointment.findOne({
      _id: req.params.id,
      patient: req.user._id,
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointment.status === 'cancelled') {
      return res.status(400).json({ message: 'Cancelled appointments cannot be paid for' });
    }

    if (appointment.paymentStatus === 'paid') {
      const readyAppointment = await ensureConsultationRoom(appointment);
      return res.json({
        message: 'Appointment is already paid',
        paymentStatus: readyAppointment.paymentStatus,
        paymentReference: readyAppointment.paymentReference,
        consultation: buildAccessResponse(readyAppointment),
        appointment: readyAppointment,
      });
    }

    appointment.paymentStatus = 'paid';
    appointment.paymentMethod = String(req.body.paymentMethod || 'manual');
    appointment.paymentReference =
      String(req.body.paymentReference || '').trim() ||
      `PAY-${toObjectIdString(appointment._id).slice(-6).toUpperCase()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    appointment.paymentCompletedAt = new Date();

    const savedAppointment = await appointment.save();
    const appointmentWithRoom = await ensureConsultationRoom(savedAppointment);

    res.json({
      message: 'Payment confirmed and consultation room generated',
      paymentStatus: appointmentWithRoom.paymentStatus,
      paymentReference: appointmentWithRoom.paymentReference,
      appointment: appointmentWithRoom,
      consultation: buildAccessResponse(appointmentWithRoom),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get consultation access details for a booked appointment
// @route   GET /api/appointments/:id/consultation-access
// @access  Private
export const getConsultationAccess = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database is not connected' });
    }

    const appointment = await Appointment.findById(req.params.id)
      .populate({
        path: 'doctor',
        select: 'name email specializations profilePicture',
      })
      .populate({
        path: 'patient',
        select: 'name email phone profilePicture',
      });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (!isAppointmentParticipant(appointment, req.user._id)) {
      return res.status(403).json({ message: 'You are not authorized to access this consultation' });
    }

    if (appointment.status === 'cancelled') {
      return res.status(400).json({ message: 'This appointment has been cancelled' });
    }

    if (appointment.paymentStatus !== 'paid') {
      const consultation = buildAccessResponse(appointment);
      return res.status(402).json({
        message: 'Payment is required before the consultation can be accessed',
        appointment,
        consultation,
      });
    }

    const roomReadyAppointment = await ensureConsultationRoom(appointment);
    const consultation = buildAccessResponse(roomReadyAppointment);

    if (consultation.isTooEarly) {
      return res.status(200).json({
        message: 'The consultation window is not open yet',
        appointment: roomReadyAppointment,
        consultation,
      });
    }

    if (consultation.isExpired) {
      return res.status(410).json({
        message: 'The consultation window has ended',
        appointment: roomReadyAppointment,
        consultation,
      });
    }

    res.json({
      message: 'Consultation access granted',
      appointment: roomReadyAppointment,
      consultation,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

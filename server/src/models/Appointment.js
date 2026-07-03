import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorName: { type: String, required: true },
  doctorSpecialty: { type: String, default: 'General Physician' },
  patientName: { type: String },
  patientEmail: { type: String },
  patientPhone: { type: String },
  date: { type: Date, required: true },
  timeSlot: { type: String, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending' },
  reason: { type: String },
  complaint: { type: String },
  cancellationReason: { type: String, default: '' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },
  paymentMethod: { type: String, default: '' },
  paymentReference: { type: String, default: '' },
  paymentCompletedAt: { type: Date, default: null },
  razorpayOrderId: { type: String, default: '' },
  razorpayPaymentId: { type: String, default: '' },
  razorpaySignature: { type: String, default: '' },
  razorpayVerifiedAt: { type: Date, default: null },
  consultationProvider: { type: String, default: 'webrtc' },
  consultationRoomName: { type: String, default: '' },
  consultationRoomCreatedAt: { type: Date, default: null },
  consultationReadyAt: { type: Date, default: null },
  consultationExpiresAt: { type: Date, default: null },
  consultationNotes: { type: String },
}, { timestamps: true });

const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment;

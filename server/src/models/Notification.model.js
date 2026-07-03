import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', default: null },
  type: {
    type: String,
    enum: [
      'appointment_received',
      'appointment_confirmed',
      'appointment_cancelled',
      'appointment_reminder',
    ],
    required: true,
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['queued', 'sent', 'read'], default: 'sent' },
  scheduledFor: { type: Date, default: null },
  sentAt: { type: Date, default: null },
  readAt: { type: Date, default: null },
}, { timestamps: true });

notificationSchema.index({ user: 1, appointment: 1, type: 1, scheduledFor: 1 }, { unique: false });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;

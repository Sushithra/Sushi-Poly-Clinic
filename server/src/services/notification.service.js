import Notification from '../models/Notification.model.js';
import Appointment from '../models/Appointment.js';
import { sendPushToUser } from './pushNotification.service.js';

const buildNotificationKey = ({ user, appointment, type, scheduledFor }) => ({
  user,
  appointment: appointment || null,
  type,
  scheduledFor: scheduledFor || null,
});

export const createNotification = async ({
  user,
  appointment = null,
  type,
  title,
  message,
  status = 'sent',
  scheduledFor = null,
  sentAt = status === 'sent' ? new Date() : null,
}) => {
  if (!user || !type || !title || !message) {
    return null;
  }

  const key = buildNotificationKey({ user, appointment, type, scheduledFor });
  const existing = await Notification.findOne(key);
  if (existing) {
    return existing;
  }

  return Notification.create({
    user,
    appointment,
    type,
    title,
    message,
    status,
    scheduledFor,
    sentAt,
  });
};

export const queueAppointmentReminder = async ({
  user,
  appointment,
  role,
  reminderTime,
  doctorName,
  patientName,
  timeSlot,
  minutesBefore = 5,
}) => {
  if (!reminderTime) {
    return null;
  }

  const title = 'Appointment reminder';
  const isDoctor = role === 'doctor';
  const name = isDoctor ? patientName || 'Patient' : doctorName || 'Doctor';

  return createNotification({
    user,
    appointment,
    type: 'appointment_reminder',
    title,
    message: `You have an appointment with ${name} in ${minutesBefore} minutes at ${timeSlot}.`,
    status: 'queued',
    scheduledFor: reminderTime,
    sentAt: null,
  });
};

export const queueAppointmentReceipt = async ({ doctorUserId, appointmentId, patientName, dateLabel, timeSlot }) =>
  createNotification({
    user: doctorUserId,
    appointment: appointmentId,
    type: 'appointment_received',
    title: 'New appointment received',
    message: `${patientName} booked an appointment for ${dateLabel} at ${timeSlot}.`,
  });

export const queueAppointmentConfirmation = async ({ patientUserId, appointmentId, doctorName, dateLabel, timeSlot }) =>
  createNotification({
    user: patientUserId,
    appointment: appointmentId,
    type: 'appointment_confirmed',
    title: 'Appointment confirmed',
    message: `Your appointment with ${doctorName} on ${dateLabel} at ${timeSlot} has been confirmed.`,
  });

export const queueAppointmentCancellation = async ({ patientUserId, appointmentId, doctorName, dateLabel, timeSlot }) =>
  createNotification({
    user: patientUserId,
    appointment: appointmentId,
    type: 'appointment_cancelled',
    title: 'Appointment cancelled',
    message: `Your appointment with ${doctorName} on ${dateLabel} at ${timeSlot} is no longer available.`,
  });

export const queueAppointmentRefunded = async ({ patientUserId, appointmentId, doctorName, dateLabel, timeSlot, reason }) =>
  createNotification({
    user: patientUserId,
    appointment: appointmentId,
    type: 'appointment_refunded',
    title: 'Appointment cancelled and refunded',
    message: `Your appointment with ${doctorName} on ${dateLabel} at ${timeSlot} was cancelled. Refund has been initiated. Reason: ${reason || 'No reason provided'}.`,
  });

export const deliverQueuedNotifications = async () => {
  const now = new Date();
  const pending = await Notification.find({
    status: 'queued',
    scheduledFor: { $lte: now },
  });

  if (pending.length === 0) {
    return 0;
  }

  const ids = pending.map((notification) => notification._id);
  await Notification.updateMany(
    { _id: { $in: ids } },
    {
      $set: {
        status: 'sent',
        sentAt: now,
      },
    },
  );

  await Promise.allSettled(
    pending.map((notification) =>
      sendPushToUser({
        userId: notification.user,
        title: notification.title,
        body: notification.message,
        data: {
          notificationId: notification._id,
          appointmentId: notification.appointment || '',
          type: notification.type,
        },
      }),
    ),
  );

  return ids.length;
};

export const startNotificationScheduler = () => {
  if (globalThis.__eclinicNotificationScheduler) {
    return globalThis.__eclinicNotificationScheduler;
  }

  const interval = setInterval(() => {
    deliverQueuedNotifications().catch((error) => {
      console.error('Notification scheduler error:', error.message);
    });
  }, 60 * 1000);

  globalThis.__eclinicNotificationScheduler = interval;
  return interval;
};

export const clearAppointmentNotifications = async (appointmentIds = []) => {
  if (!Array.isArray(appointmentIds) || appointmentIds.length === 0) {
    return;
  }

  await Notification.deleteMany({
    appointment: { $in: appointmentIds },
    type: 'appointment_reminder',
    status: 'queued',
  });
};

export const cleanupOrphanNotifications = async () => {
  const notifications = await Notification.find({
    appointment: { $ne: null },
  }).select('appointment');

  const validIds = await Appointment.distinct('_id', {});
  const orphanIds = notifications
    .filter((notification) => notification.appointment && !validIds.some((id) => String(id) === String(notification.appointment)))
    .map((notification) => notification._id);

  if (orphanIds.length > 0) {
    await Notification.deleteMany({ _id: { $in: orphanIds } });
  }
};

// Asia/Kolkata (IST) is UTC+5:30 and does not observe daylight saving time.
const KOLKATA_OFFSET_MS = 5.5 * 60 * 60 * 1000;

// A patient/doctor may join the consultation 5 minutes before the scheduled time.
export const CONSULTATION_WINDOW_BEFORE_MINUTES = 5;

const parseTimeSlot = (timeSlot) => {
  const match = String(timeSlot || '').trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const meridian = match[3].toUpperCase();

  if (Number.isNaN(hours) || Number.isNaN(minutes) || hours < 1 || hours > 12 || minutes < 0 || minutes > 59) {
    return null;
  }

  hours = hours % 12;
  if (meridian === 'PM') {
    hours += 12;
  }

  return { hours, minutes };
};

export const parseAppointmentDateTime = (dateValue, timeSlot) => {
  if (dateValue instanceof Date) {
    const parsedDate = new Date(dateValue);
    if (Number.isNaN(parsedDate.getTime())) {
      return null;
    }

    const timeParts = parseTimeSlot(timeSlot);
    if (!timeParts) {
      return null;
    }

    // The stored `date` represents the wall-clock calendar day (UTC midnight).
    // Treat the date + timeSlot as Asia/Kolkata wall-clock time and convert to the
    // correct UTC instant regardless of the server's own timezone (IST is UTC+5:30).
    return new Date(
      Date.UTC(
        parsedDate.getUTCFullYear(),
        parsedDate.getUTCMonth(),
        parsedDate.getUTCDate(),
        timeParts.hours,
        timeParts.minutes,
        0,
        0,
      ) - KOLKATA_OFFSET_MS,
    );
  }

  const text = String(dateValue || '').trim();
  const match = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    return null;
  }

  const [, year, month, day] = match;
  const timeParts = parseTimeSlot(timeSlot);
  if (!timeParts) {
    return null;
  }

  // Treat the appointment date + timeSlot as Asia/Kolkata wall-clock time and
  // convert it to the correct UTC instant. IST is UTC+5:30, so subtract the offset.
  const parsedDate = new Date(
    Date.UTC(Number(year), Number(month) - 1, Number(day), timeParts.hours, timeParts.minutes, 0, 0) -
      KOLKATA_OFFSET_MS,
  );

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate;
};

export const isAtLeastHoursAhead = (appointmentDateTime, hours) => {
  if (!(appointmentDateTime instanceof Date) || Number.isNaN(appointmentDateTime.getTime())) {
    return false;
  }

  const minStart = new Date(Date.now() + hours * 60 * 60 * 1000);
  return appointmentDateTime.getTime() >= minStart.getTime();
};

export const getReminderTime = (appointmentDateTime, minutesBefore = 10) => {
  if (!(appointmentDateTime instanceof Date) || Number.isNaN(appointmentDateTime.getTime())) {
    return null;
  }

  return new Date(appointmentDateTime.getTime() - minutesBefore * 60 * 1000);
};

export const getConsultationWindow = (appointmentDateTime, openBeforeMinutes = 0, closeAfterMinutes = 240) => {
  if (!(appointmentDateTime instanceof Date) || Number.isNaN(appointmentDateTime.getTime())) {
    return { startsAt: null, endsAt: null };
  }

  return {
    startsAt: new Date(appointmentDateTime.getTime() - openBeforeMinutes * 60 * 1000),
    endsAt: new Date(appointmentDateTime.getTime() + closeAfterMinutes * 60 * 1000),
  };
};

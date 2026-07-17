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
  let parsedDate;

  if (dateValue instanceof Date) {
    parsedDate = new Date(dateValue);
  } else {
    const text = String(dateValue || '').trim();
    const match = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) {
      return null;
    }

    const [, year, month, day] = match;
    parsedDate = new Date(Number(year), Number(month) - 1, Number(day));
  }

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  const timeParts = parseTimeSlot(timeSlot);
  if (!timeParts) {
    return null;
  }

  parsedDate.setHours(timeParts.hours, timeParts.minutes, 0, 0);
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

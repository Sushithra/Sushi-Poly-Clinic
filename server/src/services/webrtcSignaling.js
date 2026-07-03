import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import Appointment from '../models/Appointment.js';
import User from '../models/User.js';
import { getConsultationWindow, parseAppointmentDateTime } from './appointmentTiming.js';

const CONSULTATION_WINDOW_BEFORE_MINUTES = 1;
const CONSULTATION_WINDOW_AFTER_MINUTES = 240;

const toIdString = (value) => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value._id) return String(value._id);
  return String(value);
};

const isAppointmentParticipant = (appointment, userId) => {
  const requestedUserId = toIdString(userId);
  return requestedUserId && (
    toIdString(appointment.patient) === requestedUserId ||
    toIdString(appointment.doctor) === requestedUserId
  );
};

const getRoomState = (rooms, roomId) => {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      participants: new Map(),
      initiatorSocketId: '',
    });
  }

  return rooms.get(roomId);
};

const removeParticipant = (rooms, roomId, socketId) => {
  const room = rooms.get(roomId);
  if (!room) return null;

  const participant = room.participants.get(socketId) || null;
  room.participants.delete(socketId);

  if (room.initiatorSocketId === socketId) {
    room.initiatorSocketId = room.participants.keys().next().value || '';
  }

  if (room.participants.size === 0) {
    rooms.delete(roomId);
  }

  return participant;
};

const findParticipantSocketId = (room, userId) => {
  for (const [socketId, participant] of room.participants.entries()) {
    if (participant.userId === userId) {
      return socketId;
    }
  }

  return '';
};

export const registerWebrtcSignaling = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: true,
      credentials: true,
    },
  });

  const rooms = new Map();

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];

      if (!token) {
        return next(new Error('Authentication token is required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return next(new Error('Authenticated user not found'));
      }

      socket.data.user = user.toObject();
      next();
    } catch (error) {
      next(new Error(error.message || 'Socket authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    socket.on('join-room', async ({ appointmentId }, ack = () => {}) => {
      try {
        if (!appointmentId) {
          throw new Error('appointmentId is required');
        }

        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
          throw new Error('Appointment not found');
        }

        if (appointment.status === 'cancelled') {
          throw new Error('This appointment has been cancelled');
        }

        if (appointment.paymentStatus !== 'paid') {
          throw new Error('Payment is required before joining the room');
        }

        const appointmentDateTime = parseAppointmentDateTime(appointment.date, appointment.timeSlot);
        const { startsAt, endsAt } = getConsultationWindow(
          appointmentDateTime,
          CONSULTATION_WINDOW_BEFORE_MINUTES,
          CONSULTATION_WINDOW_AFTER_MINUTES,
        );
        const now = new Date();
        if (startsAt && now.getTime() < startsAt.getTime()) {
          throw new Error('The consultation window is not open yet');
        }
        if (endsAt && now.getTime() > endsAt.getTime()) {
          throw new Error('The consultation window has ended');
        }

        if (!isAppointmentParticipant(appointment, socket.data.user?._id)) {
          throw new Error('You are not authorized to join this consultation');
        }

        const roomId = appointment.consultationRoomName || `appointment-${appointment._id}`;
        const room = getRoomState(rooms, roomId);

        const participant = {
          userId: toIdString(socket.data.user?._id),
          name: socket.data.user?.name || 'User',
          role: socket.data.user?.role || 'patient',
        };

        const existingSocketId = findParticipantSocketId(room, participant.userId);
        if (existingSocketId && existingSocketId !== socket.id) {
          const existingSocket = io.sockets.sockets.get(existingSocketId);
          room.participants.delete(existingSocketId);
          if (existingSocket) {
            existingSocket.leave(roomId);
            existingSocket.disconnect(true);
          }
        }

        if (!room.participants.has(socket.id) && room.participants.size >= 2) {
          throw new Error('This consultation room is already full');
        }

        room.participants.set(socket.id, participant);
        if (!room.initiatorSocketId) {
          room.initiatorSocketId = socket.id;
        }

        socket.data.roomId = roomId;
        socket.data.appointmentId = String(appointment._id);
        socket.join(roomId);

        const payload = {
          roomId,
          isInitiator: room.initiatorSocketId === socket.id,
          participantCount: room.participants.size,
          participant,
          appointmentId: String(appointment._id),
        };

        socket.emit('room-ready', payload);
        socket.to(roomId).emit('peer-joined', payload);
        ack({ success: true, ...payload });
      } catch (error) {
        ack({ success: false, message: error.message || 'Unable to join room' });
      }
    });

    socket.on('webrtc-offer', ({ roomId, offer }) => {
      if (!roomId || !offer) return;
      socket.to(roomId).emit('webrtc-offer', {
        offer,
        from: socket.id,
      });
    });

    socket.on('webrtc-answer', ({ roomId, answer }) => {
      if (!roomId || !answer) return;
      socket.to(roomId).emit('webrtc-answer', {
        answer,
        from: socket.id,
      });
    });

    socket.on('webrtc-ice-candidate', ({ roomId, candidate }) => {
      if (!roomId || !candidate) return;
      socket.to(roomId).emit('webrtc-ice-candidate', {
        candidate,
        from: socket.id,
      });
    });

    socket.on('leave-room', () => {
      const roomId = socket.data.roomId;
      if (!roomId) return;

      const room = rooms.get(roomId);
      const wasInitiator = room?.initiatorSocketId === socket.id;
      const remainingParticipant = removeParticipant(rooms, roomId, socket.id);

      socket.leave(roomId);
      socket.to(roomId).emit('peer-left', {
        roomId,
        participant: remainingParticipant,
      });

      if (room && wasInitiator && room.initiatorSocketId && room.participants.has(room.initiatorSocketId)) {
        const nextParticipant = room.participants.get(room.initiatorSocketId);
        io.to(room.initiatorSocketId).emit('room-initiator', {
          roomId,
          isInitiator: true,
          participant: nextParticipant,
        });
      }
    });

    socket.on('disconnect', () => {
      const roomId = socket.data.roomId;
      if (!roomId) return;

      const room = rooms.get(roomId);
      const wasInitiator = room?.initiatorSocketId === socket.id;
      const remainingParticipant = removeParticipant(rooms, roomId, socket.id);

      socket.to(roomId).emit('peer-left', {
        roomId,
        participant: remainingParticipant,
      });

      if (room && wasInitiator && room.initiatorSocketId && room.participants.has(room.initiatorSocketId)) {
        const nextParticipant = room.participants.get(room.initiatorSocketId);
        io.to(room.initiatorSocketId).emit('room-initiator', {
          roomId,
          isInitiator: true,
          participant: nextParticipant,
        });
      }
    });
  });

  return io;
};

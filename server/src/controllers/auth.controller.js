import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';
import Notification from '../models/Notification.model.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import crypto from 'crypto';
import { clearAppointmentNotifications, queueAppointmentCancellation } from '../services/notification.service.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '30d',
  });
};

const verifyGoogleToken = async (idToken) => {
  const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);

  if (!response.ok) {
    throw new Error('Invalid Google token');
  }

  const payload = await response.json();
  const expectedClientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID;

  if (expectedClientId && payload.aud !== expectedClientId) {
    throw new Error('Google token audience mismatch. Make sure GOOGLE_CLIENT_ID matches the client Google client ID.');
  }

  return payload;
};

const getProfileCompletionState = (user) => {
  return {
    needsProfileSetup: false,
    missingFields: [],
  };
};

const buildUserResponse = (user) => {
  const profileState = getProfileCompletionState(user);

  return {
    _id: user._id,
    id: user._id,
    name: user.name,
    email: user.email,
    picture: user.picture || user.profilePicture || '',
    profilePicture: user.profilePicture || user.picture || '',
    emailVerified: Boolean(user.emailVerified),
    role: user.role,
    googleId: user.googleId,
    age: user.age ?? null,
    specializations: user.specializations,
    experienceYears: user.experienceYears,
    consultationFee: user.consultationFee,
    isApproved: user.isApproved,
    accountStatus: user.accountStatus,
    phone: user.phone,
    ...profileState,
    token: generateToken(user._id),
  };
};

const getPrimarySpecialty = (specializations = []) => {
  if (Array.isArray(specializations) && specializations.length > 0) {
    return specializations[0];
  }

  return 'General Physician';
};

const syncDoctorRecord = async (user, extra = {}) => {
  if (!user || user.role !== 'doctor') {
    return null;
  }

  const specialty = getPrimarySpecialty(extra.specializations ?? user.specializations);

  const doctorData = {
    specialty,
    experienceYears: Number(extra.experienceYears ?? user.experienceYears ?? 0),
    consultationFee: Number(extra.consultationFee ?? user.consultationFee ?? 500),
    isApproved: extra.isApproved ?? user.isApproved ?? true,
  };

  return Doctor.findOneAndUpdate(
    { userId: user._id },
    { $set: doctorData, $setOnInsert: { userId: user._id } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      picture,
      emailVerified = false,
      age,
      specializations = [],
      experienceYears = 0,
      consultationFee = 500,
      isApproved = true,
      accountStatus = 'active',
    } = req.body;

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database is not connected' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'patient',
      picture: picture || '',
      emailVerified: Boolean(emailVerified),
      age: age !== undefined && age !== '' ? Number(age) : null,
      specializations: Array.isArray(specializations) ? specializations : [],
      experienceYears,
      consultationFee,
      isApproved,
      accountStatus,
    });

    if (user) {
      if (user.role === 'doctor') {
        await syncDoctorRecord(user, {
          specializations,
          experienceYears,
          consultationFee,
          isApproved,
        });
      }
      res.status(201).json(buildUserResponse(user));
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database is not connected' });
    }

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      if (user.role === 'doctor') {
        await syncDoctorRecord(user);
      }
      res.json(buildUserResponse(user));
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user with Google & get token
// @route   POST /api/auth/google
// @access  Public
export const googleAuth = async (req, res) => {
  try {
    const {
      idToken,
      role,
      mode = 'login',
      specializations = [],
      experienceYears = 0,
      consultationFee = 500,
      age,
    } = req.body;

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database is not connected' });
    }

    if (!idToken) {
      return res.status(400).json({ message: 'Google token is required' });
    }

    const googleUser = await verifyGoogleToken(idToken);
    const requestedRole = role === 'doctor' ? 'doctor' : 'patient';
    const authMode = mode === 'register' ? 'register' : 'login';
    const email = googleUser.email?.toLowerCase();
    const name = googleUser.name || googleUser.given_name || email?.split('@')[0] || 'User';
    const profilePicture = googleUser.picture || '';
    const emailVerified = Boolean(googleUser.email_verified === 'true' || googleUser.email_verified === true);

    if (!email) {
      return res.status(400).json({ message: 'Google account does not provide an email address' });
    }

    let user = await User.findOne({
      $or: [{ email }, { googleId: googleUser.sub }],
    });

    if (user && user.role !== requestedRole) {
      return res.status(403).json({
        message: `This Google account is registered as a ${user.role}. Please use the ${user.role} portal.`,
      });
    }

    if (!user && requestedRole === 'doctor' && authMode !== 'register') {
      return res.status(404).json({
        message: 'No doctor account found for this Google email. Please register as a doctor first.',
      });
    }

    if (!user && requestedRole === 'doctor' && (!Array.isArray(specializations) || specializations.length === 0)) {
      return res.status(400).json({
        message: 'Please select at least one specialization when registering as a new doctor.',
      });
    }

    if (!user) {
      user = await User.create({
        name,
        email,
        password: crypto.randomBytes(24).toString('hex'),
        role: requestedRole,
        googleId: googleUser.sub,
        picture: profilePicture,
        emailVerified,
        age: age !== undefined && age !== '' ? Number(age) : null,
        profilePicture: profilePicture,
        specializations: requestedRole === 'doctor' && Array.isArray(specializations) ? specializations : [],
        experienceYears: requestedRole === 'doctor' ? experienceYears : 0,
        consultationFee: requestedRole === 'doctor' ? consultationFee : 500,
        isApproved: true,
        accountStatus: 'active',
      });
    } else {
      if (!user.googleId) {
        user.googleId = googleUser.sub;
      }
      if (!user.name && name) {
        user.name = name;
      }
      if (!user.picture && profilePicture) {
        user.picture = profilePicture;
      }
      if (!user.profilePicture && profilePicture) {
        user.profilePicture = profilePicture;
      }
      if (emailVerified) {
        user.emailVerified = true;
      }
      if (requestedRole === 'doctor' && authMode === 'register' && Array.isArray(specializations) && specializations.length > 0 && (!user.specializations || user.specializations.length === 0)) {
        user.specializations = specializations;
      }
      if (age !== undefined && age !== '') {
        user.age = Number(age);
      }
      await user.save();
    }

    if (user.role === 'doctor') {
      await syncDoctorRecord(user, {
        specializations,
        experienceYears,
        consultationFee,
        isApproved: user.isApproved,
      });
    }

    res.json(buildUserResponse(user));
  } catch (error) {
    res.status(401).json({ message: error.message || 'Google sign-in failed' });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json(buildUserResponse(user));
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current authenticated user
// @route   GET /api/auth/me
// @access  Private
export const getCurrentUser = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      picture: user.picture || user.profilePicture || '',
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const {
      name,
      age,
      phone,
      profilePicture,
      specializations,
      experienceYears,
      consultationFee,
      currentPassword,
      newPassword,
    } = req.body;

    if (name !== undefined) user.name = name;
    if (age !== undefined && age !== '') user.age = Number(age);
    if (phone !== undefined) user.phone = phone;
    if (profilePicture !== undefined) user.profilePicture = profilePicture;

    if (user.role === 'doctor') {
      if (Array.isArray(specializations)) {
        user.specializations = specializations;
      }
      if (experienceYears !== undefined && experienceYears !== '') {
        user.experienceYears = Number(experienceYears);
      }
      if (consultationFee !== undefined && consultationFee !== '') {
        user.consultationFee = Number(consultationFee);
      }
    }

    if (newPassword) {
      if (!user.googleId) {
        if (!currentPassword) {
          return res.status(400).json({ message: 'Current password is required' });
        }
        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
          return res.status(400).json({ message: 'Current password is incorrect' });
        }
      }

      user.password = newPassword;
    }

    const updatedUser = await user.save();
    if (updatedUser.role === 'doctor') {
      await syncDoctorRecord(updatedUser, {
        specializations: updatedUser.specializations,
        experienceYears: updatedUser.experienceYears,
        consultationFee: updatedUser.consultationFee,
        isApproved: updatedUser.isApproved,
      });
    }
    res.json(buildUserResponse(updatedUser));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user account
// @route   DELETE /api/auth/profile
// @access  Private
export const deleteUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'patient') {
      const patientAppointments = await Appointment.find({ patient: user._id }).select('_id');
      const appointmentIds = patientAppointments.map((appointment) => appointment._id);

      await Promise.allSettled([
        clearAppointmentNotifications(appointmentIds),
        Notification.deleteMany({ appointment: { $in: appointmentIds } }),
        Appointment.deleteMany({ patient: user._id }),
        Notification.deleteMany({ user: user._id }),
      ]);
    }

    if (user.role === 'doctor') {
      const affectedAppointments = await Appointment.find({
        doctor: user._id,
        status: { $in: ['pending', 'confirmed'] },
      }).select('_id patient doctorName date timeSlot');

      const appointmentIds = affectedAppointments.map((appointment) => appointment._id);

      await Promise.allSettled([
        Appointment.updateMany(
          {
            doctor: user._id,
            status: { $in: ['pending', 'confirmed'] },
          },
          {
            $set: {
              status: 'cancelled',
              cancellationReason: 'Doctor is no longer available',
            },
          },
        ),
        clearAppointmentNotifications(appointmentIds),
        Notification.deleteMany({ appointment: { $in: appointmentIds } }),
        Doctor.deleteMany({ userId: user._id }),
      ]);

      await Promise.allSettled(
        affectedAppointments.map((appointment) =>
          queueAppointmentCancellation({
            patientUserId: appointment.patient,
            appointmentId: appointment._id,
            doctorName: user.name,
            dateLabel: appointment.date ? new Date(appointment.date).toLocaleDateString() : 'your appointment day',
            timeSlot: appointment.timeSlot,
          }),
        ),
      );
    }

    await Promise.allSettled([
      User.deleteOne({ _id: req.user._id }),
      Doctor.deleteMany({ userId: user._id }),
    ]);
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

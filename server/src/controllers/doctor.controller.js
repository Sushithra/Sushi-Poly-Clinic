import Doctor from '../models/Doctor.js';
import mongoose from 'mongoose';

const normalizeSpecializations = (specializations = []) => {
  if (!Array.isArray(specializations)) {
    return [];
  }

  return specializations.filter(Boolean);
};

const buildDoctorCard = (record) => {
  const specializations = normalizeSpecializations(record.specializations);
  const specialty = specializations[0] || record.specialty || 'General Physician';
  const user = record.userId || {};

  return {
    _id: user._id || record._id,
    doctorRecordId: record._id,
    name: record.name || user.name || 'Doctor',
    email: record.email || user.email || '',
    role: record.role || 'doctor',
    specializations,
    specialty,
    specialtyLabel: specializations.length > 0 ? specializations.join(', ') : specialty,
    experienceYears: record.experienceYears ?? 0,
    consultationFee: record.consultationFee ?? 500,
    rating: record.rating ?? 4.8,
    isApproved: record.isApproved ?? true,
    available: record.available ?? true,
  };
};

// @desc    Get all approved doctors
// @route   GET /api/doctors
// @access  Public
export const getDoctors = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database is not connected' });
    }

    const keyword = req.query.keyword ? String(req.query.keyword).trim().toLowerCase() : '';

    const doctorRecords = await Doctor.find({
      isApproved: true,
      ...(keyword ? { specialty: { $regex: keyword, $options: 'i' } } : {}),
    })
      .populate({
        path: 'userId',
        match: { role: 'doctor' },
        select: 'name email role specializations isApproved accountStatus profilePicture phone createdAt updatedAt',
      })
      .sort({ createdAt: -1 });

    const mergedDoctors = doctorRecords
      .filter((doctor) => doctor.userId && (doctor.userId.isApproved ?? true) && (doctor.userId.accountStatus ?? 'active') !== 'pending')
      .map((doctor) =>
        buildDoctorCard({
          ...doctor.toObject(),
          specializations: doctor.userId?.specializations?.length ? doctor.userId.specializations : (doctor.specialty ? [doctor.specialty] : []),
          experienceYears: doctor.experienceYears,
          consultationFee: doctor.consultationFee,
          isApproved: doctor.isApproved,
          userId: doctor.userId,
        }),
      );

    if (keyword) {
      const filteredDoctors = mergedDoctors.filter((doctor) => {
        const haystack = [
          doctor.name,
          doctor.specialty,
          doctor.specialtyLabel,
          ...(doctor.specializations || []),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        return haystack.includes(keyword);
      });

      return res.json(filteredDoctors);
    }

    return res.json(mergedDoctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single doctor by ID
// @route   GET /api/doctors/:id
// @access  Public
export const getDoctorById = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database is not connected' });
    }

    const doctor = await Doctor.findOne({ userId: req.params.id, isApproved: true })
      .populate({
        path: 'userId',
        match: { role: 'doctor' },
        select: 'name email role specializations isApproved accountStatus profilePicture phone createdAt updatedAt',
      });

    if (doctor) {
      return res.json(
        buildDoctorCard({
          ...doctor.toObject(),
          specializations: doctor.userId?.specializations?.length ? doctor.userId.specializations : (doctor.specialty ? [doctor.specialty] : []),
          experienceYears: doctor.experienceYears,
          consultationFee: doctor.consultationFee,
          rating: doctor.rating,
          isApproved: doctor.isApproved,
          userId: doctor.userId,
        }),
      );
    }

    res.status(404).json({ message: 'Doctor not found' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  specialty: { type: String, required: true },
  experienceYears: { type: Number, required: true },
  consultationFee: { type: Number, required: true },
  consultationPricing: { type: Object, default: {} },
  bio: { type: String },
  qualifications: [{ type: String }],
  availableSlots: [{ 
    date: Date,
    time: String,
    isBooked: { type: Boolean, default: false }
  }],
  rating: { type: Number, default: 0 },
  isApproved: { type: Boolean, default: false } // Admin approval
}, { timestamps: true });

const Doctor = mongoose.model('Doctor', doctorSchema);
export default Doctor;

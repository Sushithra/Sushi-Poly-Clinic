import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['patient', 'doctor', 'admin'], default: 'patient' },
  googleId: { type: String, default: '' },
  picture: { type: String, default: '' },
  emailVerified: { type: Boolean, default: false },
  age: { type: Number, default: null },
  specializations: { type: [String], default: [] },
  experienceYears: { type: Number, default: 0 },
  consultationFee: { type: Number, default: 500 },
  isApproved: { type: Boolean, default: true },
  accountStatus: { type: String, default: 'active' },
  profilePicture: { type: String, default: "" },
  phone: { type: String, default: "" },
}, { timestamps: true });

// Password hashing middleware
// Use promise-based middleware so we do not depend on Express-style `next`.
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;

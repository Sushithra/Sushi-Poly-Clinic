import mongoose from 'mongoose';

const patientRecordSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', default: null },
    title: { type: String, required: true },
    fileUrl: { type: String, required: true },
    publicId: { type: String, required: true },
    fileName: { type: String, default: '' },
    mimeType: { type: String, default: '' },
    fileSize: { type: Number, default: 0 },
    notes: { type: String, default: '' },
    storageType: { type: String, enum: ['local', 'cloudinary'], default: 'local' },
  },
  { timestamps: true },
);

const PatientRecord = mongoose.model('PatientRecord', patientRecordSchema);
export default PatientRecord;

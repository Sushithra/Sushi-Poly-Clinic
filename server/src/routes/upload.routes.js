import express from 'express';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import multer from 'multer';
import cloudinary, { isCloudinaryConfigured } from '../config/cloudinary.js';

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });
const uploadDir = path.resolve(process.cwd(), 'server', 'uploads');

const saveBufferLocally = async (file) => {
  await fs.mkdir(uploadDir, { recursive: true });
  const safeName = String(file.originalname || 'upload').replace(/[^a-z0-9._-]/gi, '_');
  const fileName = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}-${safeName}`;
  await fs.writeFile(path.join(uploadDir, fileName), file.buffer);
  return {
    url: `${process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 5000}`}/uploads/${fileName}`,
    public_id: fileName,
  };
};

router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    if (!isCloudinaryConfigured()) {
      return res.json(await saveBufferLocally(req.file));
    }

    const stream = cloudinary.uploader.upload_stream(
      { folder: 'eclinic_records' },
      (error, result) => {
        if (error) return res.status(500).json({ message: error.message });
        res.json({
          url: result.secure_url,
          public_id: result.public_id,
        });
      }
    );

    stream.end(req.file.buffer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

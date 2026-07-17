import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const isCloudinaryConfigured = () => {
  const key = String(process.env.CLOUDINARY_API_KEY || '').trim();
  const secret = String(process.env.CLOUDINARY_API_SECRET || '').trim();
  const cloudName = String(process.env.CLOUDINARY_CLOUD_NAME || '').trim();

  if (!key || !secret || !cloudName) return false;
  if (key === 'your_api_key' || secret === 'your_api_secret' || cloudName === 'your_cloud_name') return false;
  return true;
};

export default cloudinary;

import express from 'express';
import { registerUser, loginUser, googleAuth, getUserProfile, getCurrentUser, updateUserProfile, deleteUserProfile, registerPushToken } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleAuth);
router.get('/me', protect, getCurrentUser);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.delete('/profile', protect, deleteUserProfile);
router.post('/push-token', protect, registerPushToken);

export default router;

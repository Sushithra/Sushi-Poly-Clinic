import express from 'express';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../controllers/category.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.route('/')
  .get(getCategories)
  .post(protect, createCategory);

router.route('/:id')
  .put(protect, updateCategory)
  .delete(protect, deleteCategory);

export default router;

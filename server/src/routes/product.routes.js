import express from 'express';
import { getProducts, createProduct, deleteProduct } from '../controllers/product.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.route('/')
  .get(getProducts)
  .post(protect, createProduct);

router.route('/:id')
  .delete(protect, deleteProduct);

export default router;

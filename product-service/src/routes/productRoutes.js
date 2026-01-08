import { Router } from 'express';
import {
  createProduct,
  updateProduct,
  deleteProduct,
  listProducts,
  getProduct,
} from '../controllers/productController.js';
import { requireAdmin } from '../middlewares/auth.js';

const router = Router();

// Public routes
router.get('/', listProducts);
router.get('/:id', getProduct);

// Admin-only routes
router.post('/', requireAdmin, createProduct);
router.put('/:id', requireAdmin, updateProduct);
router.delete('/:id', requireAdmin, deleteProduct);

export default router;

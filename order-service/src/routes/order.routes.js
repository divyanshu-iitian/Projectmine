import { Router } from 'express';
import {
  createOrder,
  getUserOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  getOrderByIdInternal,
} from '../controllers/order.controller.js';
import { getOrderAnalytics } from '../controllers/analytics.controller.js';
import { requireUser, requireAdmin } from '../middlewares/auth.js';

const router = Router();

// Internal service routes (no auth required - verified by x-internal-service header)
router.patch('/:id/status', updateOrderStatus);
router.get('/:id/internal', getOrderByIdInternal);

// User routes
router.post('/', requireUser, createOrder);
router.get('/', requireUser, getUserOrders);
router.get('/:id', requireUser, getOrderById);

// Admin routes
router.get('/admin/all', requireAdmin, getAllOrders);
router.get('/admin/analytics/orders', requireAdmin, getOrderAnalytics);

export default router;

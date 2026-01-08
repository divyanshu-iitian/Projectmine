import { Router } from 'express';
import {
  initStock,
  getStockByProductId,
  reserveStock,
  releaseStock,
  adjustStock,
} from '../controllers/inventory.controller.js';
import { getInventoryAnalytics, getInventoryMovements } from '../controllers/analytics.controller.js';
import { requireAdmin, requireAuth } from '../middlewares/auth.js';

const router = Router();

// Admin-only routes
router.post('/init', requireAdmin, initStock);
router.get('/:productId', requireAdmin, getStockByProductId);
router.post('/adjust', requireAdmin, adjustStock);

// Admin analytics routes
router.get('/admin/analytics/inventory', requireAdmin, getInventoryAnalytics);
router.get('/admin/analytics/inventory/movements', requireAdmin, getInventoryMovements);

// Internal routes (will be used by Order Service)
// These don't require auth as they're called service-to-service
router.post('/reserve', reserveStock);
router.post('/release', releaseStock);

export default router;

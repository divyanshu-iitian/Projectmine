import * as inventoryService from '../services/inventory.service.js';

/**
 * Initialize stock for a product (admin only)
 * POST /inventory/init
 */
export async function initStock(req, res, next) {
  try {
    const { productId, quantity } = req.body;

    if (!productId || quantity === undefined) {
      return res.status(400).json({ error: { message: 'productId and quantity are required' } });
    }

    const result = await inventoryService.initializeStock(
      productId,
      parseInt(quantity, 10),
      req.user.id
    );

    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * Get stock for a product (admin only)
 * GET /inventory/:productId
 */
export async function getStockByProductId(req, res, next) {
  try {
    const { productId } = req.params;
    const result = await inventoryService.getStock(productId);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * Reserve stock (internal/order service)
 * POST /inventory/reserve
 */
export async function reserveStock(req, res, next) {
  try {
    const { productId, quantity } = req.body;

    if (!productId || !quantity) {
      return res.status(400).json({ error: { message: 'productId and quantity are required' } });
    }

    const performedBy = req.user ? req.user.id : 'system';
    const result = await inventoryService.reserveStock(
      productId,
      parseInt(quantity, 10),
      performedBy
    );

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * Release stock (internal/order service)
 * POST /inventory/release
 */
export async function releaseStock(req, res, next) {
  try {
    const { productId, quantity } = req.body;

    if (!productId || !quantity) {
      return res.status(400).json({ error: { message: 'productId and quantity are required' } });
    }

    const performedBy = req.user ? req.user.id : 'system';
    const result = await inventoryService.releaseStock(
      productId,
      parseInt(quantity, 10),
      performedBy
    );

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * Adjust stock (admin only)
 * POST /inventory/adjust
 */
export async function adjustStock(req, res, next) {
  try {
    const { productId, change, reason } = req.body;

    if (!productId || change === undefined) {
      return res.status(400).json({ error: { message: 'productId and change are required' } });
    }

    const result = await inventoryService.adjustStock(
      productId,
      parseInt(change, 10),
      req.user.id,
      reason || 'adjust'
    );

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

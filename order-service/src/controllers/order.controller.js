import * as orderService from '../services/order.service.js';

/**
 * Create a new order (user)
 * POST /orders
 */
export async function createOrder(req, res, next) {
  try {
    const { items } = req.body;
    const userId = req.user.id;

    const order = await orderService.createOrder(userId, items);

    res.status(201).json({ order });
  } catch (err) {
    next(err);
  }
}

/**
 * Get user's orders
 * GET /orders
 */
export async function getUserOrders(req, res, next) {
  try {
    const userId = req.user.id;
    const { status } = req.query;

    const orders = await orderService.getUserOrders(userId, { status });

    res.status(200).json({ orders, count: orders.length });
  } catch (err) {
    next(err);
  }
}

/**
 * Get specific order by ID (user - own orders only)
 * GET /orders/:id
 */
export async function getOrderById(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const order = await orderService.getOrderById(id, userId);

    res.status(200).json({ order });
  } catch (err) {
    next(err);
  }
}

/**
 * Get all orders (admin)
 * GET /admin/orders
 */
export async function getAllOrders(req, res, next) {
  try {
    const { status, userId } = req.query;

    const orders = await orderService.getAllOrders({ status, userId });

    res.status(200).json({ orders, count: orders.length });
  } catch (err) {
    next(err);
  }
}

/**
 * Update order status (internal service calls only)
 * PATCH /orders/:id/status
 */
export async function updateOrderStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const internalService = req.headers['x-internal-service'];

    // Only allow internal service calls
    if (internalService !== 'payment-service') {
      return res.status(403).json({ error: 'Forbidden: Internal service access only' });
    }

    const order = await orderService.updateOrderStatus(id, status);

    res.status(200).json({ order });
  } catch (err) {
    next(err);
  }
}

/**
 * Get order by ID for internal services
 * GET /orders/:id/internal
 */
export async function getOrderByIdInternal(req, res, next) {
  try {
    const { id } = req.params;
    const internalService = req.headers['x-internal-service'];

    // Only allow internal service calls
    if (internalService !== 'payment-service') {
      return res.status(403).json({ error: 'Forbidden: Internal service access only' });
    }

    const order = await orderService.getOrderByIdNoAuth(id);

    res.status(200).json({ order });
  } catch (err) {
    next(err);
  }
}

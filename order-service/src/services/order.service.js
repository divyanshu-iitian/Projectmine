import axios from 'axios';
import Order from '../models/Order.js';
import config from '../config/index.js';
import { ApiError } from '../middlewares/errorHandler.js';

/**
 * Fetch product details from Product Service
 */
async function fetchProduct(productId) {
  try {
    const response = await axios.get(`${config.productServiceUrl}/products/${productId}`);
    return response.data.product;
  } catch (err) {
    if (err.response?.status === 404) {
      throw new ApiError(404, `Product ${productId} not found`);
    }
    throw new ApiError(500, `Failed to fetch product ${productId}`);
  }
}

/**
 * Reserve inventory for a product
 */
async function reserveInventory(productId, quantity, userId) {
  try {
    const response = await axios.post(
      `${config.inventoryServiceUrl}/inventory/reserve`,
      { productId, quantity },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
          'x-user-role': 'user', // Will be overridden by gateway if admin
        },
      }
    );
    return response.data;
  } catch (err) {
    if (err.response?.status === 409) {
      throw new ApiError(409, err.response.data.error.message || 'Insufficient stock');
    }
    if (err.response?.status === 404) {
      throw new ApiError(404, 'Product inventory not initialized');
    }
    throw new ApiError(500, `Failed to reserve inventory for product ${productId}`);
  }
}

/**
 * Release inventory for a product (rollback)
 */
async function releaseInventory(productId, quantity, userId) {
  try {
    await axios.post(
      `${config.inventoryServiceUrl}/inventory/release`,
      { productId, quantity },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
          'x-user-role': 'user',
        },
      }
    );
  } catch (err) {
    console.error(`[order-service] Failed to release inventory for ${productId}:`, err.message);
    // Don't throw - this is a rollback operation
  }
}

/**
 * Create a new order
 * Flow:
 * 1. Validate items and fetch product prices
 * 2. Reserve inventory for all items
 * 3. If reservation succeeds, create order
 * 4. If anything fails after reservation, rollback inventory
 */
export async function createOrder(userId, items) {
  if (!items || items.length === 0) {
    throw new ApiError(400, 'Order must contain at least one item');
  }

  // Track successful reservations for rollback
  const reservations = [];

  try {
    // Step 1: Validate and enrich items with current prices
    const enrichedItems = [];
    let totalAmount = 0;

    for (const item of items) {
      const { productId, quantity } = item;

      if (!productId || !quantity || quantity <= 0) {
        throw new ApiError(400, 'Each item must have productId and positive quantity');
      }

      // Fetch current product price
      const product = await fetchProduct(productId);
      const priceSnapshot = product.price;

      enrichedItems.push({
        productId,
        quantity,
        priceSnapshot,
      });

      totalAmount += priceSnapshot * quantity;
    }

    // Step 2: Reserve inventory for all items
    for (const item of enrichedItems) {
      try {
        await reserveInventory(item.productId, item.quantity, userId);
        reservations.push({ productId: item.productId, quantity: item.quantity });
      } catch (err) {
        // Rollback any successful reservations
        for (const res of reservations) {
          await releaseInventory(res.productId, res.quantity, userId);
        }
        throw err; // Re-throw the original error
      }
    }

    // Step 3: Create order
    const order = await Order.create({
      userId,
      items: enrichedItems,
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      status: 'PENDING',
    });

    return order;
  } catch (err) {
    // If order creation failed after reservations, rollback
    if (reservations.length > 0 && !err.status) {
      for (const res of reservations) {
        await releaseInventory(res.productId, res.quantity, userId);
      }
      throw new ApiError(500, 'Order creation failed, inventory rolled back');
    }
    throw err;
  }
}

/**
 * Get orders for a specific user
 */
export async function getUserOrders(userId, filters = {}) {
  const query = { userId };

  if (filters.status) {
    query.status = filters.status;
  }

  const orders = await Order.find(query)
    .sort({ createdAt: -1 })
    .select('-__v');

  return orders;
}

/**
 * Get a specific order by ID
 * Enforces ownership - user can only access their own orders
 */
export async function getOrderById(orderId, userId) {
  const order = await Order.findOne({ _id: orderId, userId }).select('-__v');

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  return order;
}

/**
 * Get a specific order by ID without authentication
 * For internal service-to-service calls only
 */
export async function getOrderByIdNoAuth(orderId) {
  const order = await Order.findById(orderId).select('-__v');

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  return order;
}

/**
 * Get all orders (admin only)
 */
export async function getAllOrders(filters = {}) {
  const query = {};

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.userId) {
    query.userId = filters.userId;
  }

  const orders = await Order.find(query)
    .sort({ createdAt: -1 })
    .select('-__v');

  return orders;
}

/**
 * Update order status (for future payment integration)
 */
export async function updateOrderStatus(orderId, status) {
  const validStatuses = ['PENDING', 'CONFIRMED', 'CANCELLED', 'FAILED'];
  
  if (!validStatuses.includes(status)) {
    throw new ApiError(400, `Invalid status. Must be one of: ${validStatuses.join(', ')}`);
  }

  const order = await Order.findByIdAndUpdate(
    orderId,
    { status },
    { new: true }
  ).select('-__v');

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  return order;
}

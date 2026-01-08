import redis from '../config/redis.js';
import InventoryLog from '../models/InventoryLog.js';
import { ApiError } from '../middlewares/errorHandler.js';

const INVENTORY_PREFIX = 'inventory:';

/**
 * Get Redis key for product inventory
 */
function getInventoryKey(productId) {
  return `${INVENTORY_PREFIX}${productId}`;
}

/**
 * Initialize stock for a product (admin only)
 */
export async function initializeStock(productId, quantity, performedBy) {
  if (quantity < 0) {
    throw new ApiError(400, 'Quantity must be non-negative');
  }

  const key = getInventoryKey(productId);
  
  // Set initial stock in Redis
  await redis.set(key, quantity);

  // Create audit log
  await InventoryLog.create({
    productId,
    change: quantity,
    reason: 'init',
    performedBy,
  });

  return { productId, stock: quantity };
}

/**
 * Get current stock for a product
 */
export async function getStock(productId) {
  const key = getInventoryKey(productId);
  const stock = await redis.get(key);

  if (stock === null) {
    throw new ApiError(404, 'Product inventory not initialized');
  }

  return { productId, stock: parseInt(stock, 10) };
}

/**
 * Reserve stock atomically (decrements stock)
 * Returns true if successful, throws error if insufficient stock
 */
export async function reserveStock(productId, quantity, performedBy = 'system') {
  if (quantity <= 0) {
    throw new ApiError(400, 'Quantity must be positive');
  }

  const key = getInventoryKey(productId);

  // Use Lua script for atomic check-and-decrement
  const luaScript = `
    local current = redis.call('GET', KEYS[1])
    if not current then
      return -1
    end
    current = tonumber(current)
    local requested = tonumber(ARGV[1])
    if current < requested then
      return -2
    end
    redis.call('DECRBY', KEYS[1], requested)
    return current - requested
  `;

  const result = await redis.eval(luaScript, 1, key, quantity);

  if (result === -1) {
    throw new ApiError(404, 'Product inventory not initialized');
  }

  if (result === -2) {
    const currentStock = await redis.get(key);
    throw new ApiError(409, `Insufficient stock. Available: ${currentStock}, Requested: ${quantity}`);
  }

  // Create audit log
  await InventoryLog.create({
    productId,
    change: -quantity,
    reason: 'reserve',
    performedBy,
  });

  return { productId, reserved: quantity, remainingStock: result };
}

/**
 * Release stock (increments stock)
 * Used when orders are cancelled or payments fail
 */
export async function releaseStock(productId, quantity, performedBy = 'system') {
  if (quantity <= 0) {
    throw new ApiError(400, 'Quantity must be positive');
  }

  const key = getInventoryKey(productId);

  // Check if product exists
  const exists = await redis.exists(key);
  if (!exists) {
    throw new ApiError(404, 'Product inventory not initialized');
  }

  // Increment stock
  const newStock = await redis.incrby(key, quantity);

  // Create audit log
  await InventoryLog.create({
    productId,
    change: quantity,
    reason: 'release',
    performedBy,
  });

  return { productId, released: quantity, currentStock: newStock };
}

/**
 * Adjust stock (admin only)
 * Can be positive (add stock) or negative (remove stock)
 */
export async function adjustStock(productId, change, performedBy, reason = 'adjust') {
  if (change === 0) {
    throw new ApiError(400, 'Change must be non-zero');
  }

  const key = getInventoryKey(productId);

  // Check if product exists
  const exists = await redis.exists(key);
  if (!exists) {
    throw new ApiError(404, 'Product inventory not initialized');
  }

  // For negative adjustments, ensure we don't go below zero
  if (change < 0) {
    const currentStock = parseInt(await redis.get(key), 10);
    if (currentStock + change < 0) {
      throw new ApiError(409, `Cannot adjust. Would result in negative stock. Current: ${currentStock}, Change: ${change}`);
    }
  }

  // Apply adjustment
  const newStock = await redis.incrby(key, change);

  // Create audit log
  await InventoryLog.create({
    productId,
    change,
    reason,
    performedBy,
  });

  return { productId, change, currentStock: newStock };
}

import redisClient from '../config/redis.js';
import InventoryLog from '../models/InventoryLog.js';

const LOW_STOCK_THRESHOLD = parseInt(process.env.LOW_STOCK_THRESHOLD) || 10;

/**
 * Get inventory health analytics for admin dashboard
 * GET /admin/analytics/inventory
 */
export async function getInventoryAnalytics(req, res, next) {
  try {
    // Scan all inventory keys from Redis
    const keys = await scanInventoryKeys();
    
    const inventoryData = [];
    let totalStock = 0;
    const lowStockProducts = [];

    // Fetch stock levels for all products
    for (const key of keys) {
      const productId = key.replace('inventory:', '');
      const stock = await redisClient.get(key);
      const stockLevel = parseInt(stock) || 0;
      
      totalStock += stockLevel;
      inventoryData.push({ productId, stock: stockLevel });

      // Check for low stock
      if (stockLevel < LOW_STOCK_THRESHOLD && stockLevel >= 0) {
        lowStockProducts.push({
          productId,
          remaining: stockLevel,
          threshold: LOW_STOCK_THRESHOLD
        });
      }
    }

    // Calculate statistics
    const totalProductsTracked = inventoryData.length;
    const averageStockLevel = totalProductsTracked > 0 
      ? parseFloat((totalStock / totalProductsTracked).toFixed(2))
      : 0;

    // Get recent inventory changes from MongoDB logs
    const recentChanges = await InventoryLog.find()
      .sort({ timestamp: -1 })
      .limit(10)
      .select('productId change reason timestamp');

    // Calculate out of stock count
    const outOfStockCount = inventoryData.filter(item => item.stock === 0).length;

    res.json({
      totalProductsTracked,
      lowStock: lowStockProducts,
      outOfStock: outOfStockCount,
      averageStockLevel,
      totalStock,
      lowStockThreshold: LOW_STOCK_THRESHOLD,
      recentChanges
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Scan Redis for all inventory keys
 */
async function scanInventoryKeys() {
  const keys = [];
  let cursor = '0';

  do {
    const result = await redisClient.scan(
      cursor,
      'MATCH',
      'inventory:*',
      'COUNT',
      '100'
    );
    cursor = result[0];
    keys.push(...result[1]);
  } while (cursor !== '0');

  return keys;
}

/**
 * Get inventory movement trends
 * GET /admin/analytics/inventory/movements
 */
export async function getInventoryMovements(req, res, next) {
  try {
    const { days = 7 } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(days));

    // Aggregate inventory changes by day
    const movements = await InventoryLog.aggregate([
      {
        $match: {
          timestamp: { $gte: daysAgo }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            reason: '$reason'
          },
          totalChange: { $sum: '$change' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.date': 1 }
      }
    ]);

    // Group by reason
    const byReason = await InventoryLog.aggregate([
      {
        $match: {
          timestamp: { $gte: daysAgo }
        }
      },
      {
        $group: {
          _id: '$reason',
          totalChange: { $sum: '$change' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      movements,
      byReason,
      period: `Last ${days} days`
    });
  } catch (err) {
    next(err);
  }
}

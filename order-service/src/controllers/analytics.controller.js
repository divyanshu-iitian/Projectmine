import Order from '../models/Order.js';

/**
 * Get order analytics for admin dashboard
 * GET /admin/analytics/orders
 */
export async function getOrderAnalytics(req, res, next) {
  try {
    // Total orders count
    const totalOrders = await Order.countDocuments();

    // Orders by status
    const statusAggregation = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const ordersByStatus = statusAggregation.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    // Daily order trend (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyTrend = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      },
      {
        $project: {
          _id: 0,
          date: '$_id',
          count: 1
        }
      }
    ]);

    // Average order value
    const avgOrderValue = await Order.aggregate([
      {
        $group: {
          _id: null,
          avgValue: { $avg: '$totalAmount' }
        }
      }
    ]);

    res.json({
      totalOrders,
      ordersByStatus,
      dailyOrderTrend: dailyTrend,
      averageOrderValue: avgOrderValue.length > 0 ? parseFloat(avgOrderValue[0].avgValue.toFixed(2)) : 0
    });
  } catch (err) {
    next(err);
  }
}

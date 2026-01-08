import Payment from '../models/Payment.js';

/**
 * Get revenue analytics for admin dashboard
 * GET /admin/analytics/revenue
 */
export async function getRevenueAnalytics(req, res, next) {
  try {
    // Total revenue from successful payments
    const revenueAgg = await Payment.aggregate([
      {
        $match: { status: 'SUCCESS' }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].totalRevenue : 0;

    // Daily revenue trend (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyRevenue = await Payment.aggregate([
      {
        $match: {
          status: 'SUCCESS',
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          amount: { $sum: '$amount' }
        }
      },
      {
        $sort: { _id: 1 }
      },
      {
        $project: {
          _id: 0,
          date: '$_id',
          amount: { $round: ['$amount', 2] }
        }
      }
    ]);

    // Payment success rate
    const totalPayments = await Payment.countDocuments();
    const successfulPayments = await Payment.countDocuments({ status: 'SUCCESS' });
    const paymentSuccessRate = totalPayments > 0 
      ? parseFloat(((successfulPayments / totalPayments) * 100).toFixed(2))
      : 0;

    res.json({
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      currency: 'USD',
      dailyRevenue,
      paymentSuccessRate,
      totalPayments,
      successfulPayments
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get payment health analytics for admin dashboard
 * GET /admin/analytics/payments
 */
export async function getPaymentAnalytics(req, res, next) {
  try {
    // Payment status breakdown
    const statusAgg = await Payment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const statusBreakdown = statusAgg.reduce((acc, item) => {
      acc[item._id.toLowerCase()] = item.count;
      return acc;
    }, {});

    // For real implementation with Stripe metadata, you would extract failure reasons
    // For now, we'll provide a placeholder structure
    const failureReasons = {
      card_declined: statusBreakdown.failed || 0,
      insufficient_funds: 0,
      expired_card: 0,
      other: 0
    };

    // Recent payment trend (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentTrend = await Payment.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            status: '$status'
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.date': 1 }
      }
    ]);

    res.json({
      success: statusBreakdown.success || 0,
      failed: statusBreakdown.failed || 0,
      initiated: statusBreakdown.initiated || 0,
      failureReasons,
      recentTrend
    });
  } catch (err) {
    next(err);
  }
}

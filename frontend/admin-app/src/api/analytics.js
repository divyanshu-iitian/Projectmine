import client from './client';

export const getAnalyticsSummary = async () => {
  try {
    const response = await client.get('/admin/analytics/summary');
    console.log('Analytics summary response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Analytics API error:', error);
    // Return default values if API fails
    return {
      totalRevenue: 0,
      totalOrders: 0,
      totalProducts: 0,
      totalUsers: 0
    };
  }
};

export const getRevenueAnalytics = async () => {
  const response = await client.get('/admin/analytics/revenue');
  return response.data;
};

export const getOrderAnalytics = async () => {
  const response = await client.get('/admin/analytics/orders');
  return response.data;
};

export const getInventoryAnalytics = async () => {
  const response = await client.get('/admin/analytics/inventory');
  return response.data;
};

export const getPaymentAnalytics = async () => {
  const response = await client.get('/admin/analytics/payments');
  return response.data;
};

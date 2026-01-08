import client from './client';

export const getAnalyticsSummary = async () => {
  const response = await client.get('/admin/analytics/summary');
  return response.data;
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

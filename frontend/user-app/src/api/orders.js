import apiClient from './client';

export const ordersAPI = {
  create: async (orderData) => {
    const response = await apiClient.post('/orders', orderData);
    return response.data;
  },

  getMyOrders: async () => {
    const response = await apiClient.get('/orders/my');
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/orders/${id}`);
    return response.data;
  },
};

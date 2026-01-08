import apiClient from './client';

export const paymentsAPI = {
  createCheckout: async (orderId) => {
    const response = await apiClient.post('/payments/create-checkout', { orderId });
    return response.data;
  },
};

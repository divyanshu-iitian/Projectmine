import client from './client';

export const initInventory = async (productId, quantity) => {
  const response = await client.post('/inventory/init', {
    productId,
    quantity,
  });
  return response.data;
};

export const adjustInventory = async (productId, change, reason) => {
  const response = await client.post('/inventory/adjust', {
    productId,
    change,
    reason,
  });
  return response.data;
};

export const getInventoryStatus = async (productId) => {
  const response = await client.get(`/inventory/${productId}`);
  return response.data;
};

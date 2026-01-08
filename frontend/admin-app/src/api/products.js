import client from './client';

export const getAllProducts = async () => {
  console.log('API: Fetching all products');
  const response = await client.get('/products');
  console.log('API: Products response:', response.data);
  return response.data;
};

export const createProduct = async (productData) => {
  console.log('API: Creating product with data:', productData);
  const response = await client.post('/products', productData);
  console.log('API: Create response:', response.data);
  return response.data;
};

export const updateProduct = async (id, productData) => {
  console.log('API: Updating product', id, 'with data:', productData);
  const response = await client.put(`/products/${id}`, productData);
  console.log('API: Update response:', response.data);
  return response.data;
};

export const deleteProduct = async (id) => {
  console.log('API: Deleting product', id);
  const response = await client.delete(`/products/${id}`);
  console.log('API: Delete response:', response.data);
  return response.data;
};

import client from './client';

export const adminLogin = async (email, password) => {
  console.log('API: Calling login endpoint...');
  const response = await client.post('/auth/login', { email, password });
  console.log('API: Login response received:', response.data);
  return response.data;
};

export const verifyAdminToken = async () => {
  console.log('API: Verifying token...');
  const response = await client.get('/auth/verify');
  console.log('API: Verify response:', response.data);
  return response.data;
};

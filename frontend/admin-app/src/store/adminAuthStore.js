import { create } from 'zustand';
import { adminLogin, verifyAdminToken } from '../api/auth';

export const useAdminAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  loading: true,

  login: async (email, password) => {
    try {
      console.log('📡 Calling login API...');
      const data = await adminLogin(email, password);
      console.log('📦 Login response:', data);
      
      // Check if user is admin
      if (data.user.role !== 'admin') {
        throw new Error('Access denied. Admin privileges required.');
      }
      
      localStorage.setItem('adminToken', data.token);
      console.log('💾 Token saved, updating state...');
      set({ user: data.user, isAuthenticated: true, loading: false });
      console.log('✨ Auth state updated!');
      return data;
    } catch (error) {
      console.error('💥 Login failed:', error);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('adminToken');
    set({ user: null, isAuthenticated: false });
  },

  verifyToken: async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        set({ loading: false });
        return;
      }

      const data = await verifyAdminToken();
      
      if (data.user.role !== 'admin') {
        localStorage.removeItem('adminToken');
        set({ user: null, isAuthenticated: false, loading: false });
        return;
      }

      set({ user: data.user, isAuthenticated: true, loading: false });
    } catch (error) {
      localStorage.removeItem('adminToken');
      set({ user: null, isAuthenticated: false, loading: false });
    }
  },
}));

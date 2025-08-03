import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import api from '../services/api.js';
import toast from 'react-hot-toast';

const useAuthStore = create(
  devtools(
    (set, get) => ({
      // State
      user: null,
      token: null,
      loading: false,
      initialized: false,

      // Actions
      initializeAuth: async () => {
        try {
          set({ loading: true });
          const token = localStorage.getItem('token');
          
          if (!token) {
            set({ loading: false, initialized: true });
            return;
          }

          // Set token in API headers
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Get current user profile
          const response = await api.post('/auth/currentUserProfile');
          
          set({
            user: response.data.data,
            token,
            loading: false,
            initialized: true
          });
        } catch (error) {
          console.error('Auth initialization failed:', error);
          localStorage.removeItem('token');
          delete api.defaults.headers.common['Authorization'];
          set({
            user: null,
            token: null,
            loading: false,
            initialized: true
          });
        }
      },

      login: async (credentials) => {
        try {
          set({ loading: true });
          
          const response = await api.post('/auth/login', credentials);
          const { user, token } = response.data.data;

          // Store token
          localStorage.setItem('token', token);
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

          set({
            user,
            token,
            loading: false
          });

          toast.success('Welcome back! Login successful.');
          return { success: true };
        } catch (error) {
          set({ loading: false });
          const message = error.response?.data?.message || 'Login failed';
          toast.error(message);
          return { success: false, message };
        }
      },

      register: async (userData) => {
        try {
          set({ loading: true });
          
          const response = await api.post('/auth/register', userData);
          const { user, token } = response.data.data;

          // Store token
          localStorage.setItem('token', token);
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

          set({
            user,
            token,
            loading: false
          });

          toast.success('Account created successfully! Welcome to our wellness platform.');
          return { success: true };
        } catch (error) {
          set({ loading: false });
          const message = error.response?.data?.message || 'Registration failed';
          toast.error(message);
          return { success: false, message };
        }
      },

      logout: async () => {
        try {
          await api.post('/auth/logout');
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          // Clear local state regardless of API call result
          localStorage.removeItem('token');
          delete api.defaults.headers.common['Authorization'];
          
          set({
            user: null,
            token: null
          });
          
          toast.success('Logged out successfully');
        }
      },

      updateProfile: async (profileData) => {
        try {
          set({ loading: true });
          
          const response = await api.put('/auth/updateProfile', profileData);
          const updatedUser = response.data.data;

          set({
            user: updatedUser,
            loading: false
          });

          toast.success('Profile updated successfully');
          return { success: true };
        } catch (error) {
          set({ loading: false });
          const message = error.response?.data?.message || 'Profile update failed';
          toast.error(message);
          return { success: false, message };
        }
      },

      // Utility functions
      isAuthenticated: () => {
        const { user, token } = get();
        return !!(user && token);
      },

      getAuthHeader: () => {
        const { token } = get();
        return token ? { Authorization: `Bearer ${token}` } : {};
      }
    }),
    {
      name: 'auth-store'
    }
  )
);

export { useAuthStore };
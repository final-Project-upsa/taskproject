import { create } from 'zustand';
import api, { getSubdomain } from '../utils/api';

export const useAuthStore = create((set) => ({
  // State
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // Actions
  registerOrg: async (formData) => {
    try {
      set({ isLoading: true, error: null });
      console.log('Sending form data:', formData);
      
      // Register organization (this goes to main API)
      const response = await api.post('/api/register/', formData);
      const { user, tokens, organization } = response.data;
      
      // Save tokens and subdomain
      localStorage.setItem('access_token', tokens.access);
      localStorage.setItem('refresh_token', tokens.refresh);
      localStorage.setItem('subdomain', organization.subdomain);
      
      set({ 
        user, 
        isAuthenticated: true, 
        isLoading: false 
      });

      // Redirect to subdomain
      if (window.location.hostname === 'localhost') {
        window.location.href = `http://${organization.subdomain}.localhost:5173/dashboard`;
      } else {
        window.location.href = `https://${organization.subdomain}.${import.meta.env.VITE_APP_DOMAIN}`;
      }

    } catch (error) {
      set({ 
        error: error.response?.data?.error || 'Registration failed', 
        isLoading: false 
      });
      throw error;
    }
  },

  checkAuth: async () => {
    const token = localStorage.getItem('access_token');
    const subdomain = localStorage.getItem('subdomain');

    if (!token || !subdomain) {
      set({ isAuthenticated: false, isLoading: false });
      return false;
    }

    try {
      set({ isLoading: true });
      // Use the same endpoint that your dashboard uses to fetch user data
      const response = await api.get('/api/user/dashboard/');
      
      set({ 
        user: response.data,
        isAuthenticated: true,
        isLoading: false 
      });
      return true;
    } catch (error) {
      console.error('Auth check failed:', error);
      // Clear stored data on auth failure
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('subdomain');
      
      set({ 
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Session expired' 
      });
      return false;
    }
  },

  login: async (credentials) => {
    try {
      set({ isLoading: true, error: null });

      const subdomain = getSubdomain();
      console.log('Auth store - attempting login with subdomain:', subdomain);
      
      if (!subdomain) {
        set({ 
          error: 'Please access through your organization URL', 
          isLoading: false 
        });
        return false;
      }

      // Update the endpoint to match your Django URL pattern
      const response = await api.post('/api/auth/login/', {
        ...credentials,
        subdomain: subdomain // Include subdomain in the request
      });
      
      const { user, tokens } = response.data;
      
      localStorage.setItem('access_token', tokens.access);
      localStorage.setItem('refresh_token', tokens.refresh);
      localStorage.setItem('subdomain', subdomain); // Store subdomain in localStorage
      
      set({ 
        user, 
        isAuthenticated: true, 
        isLoading: false 
      });

      return true;
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Login failed';
      console.error('Login error:', errorMessage);
      set({ 
        error: errorMessage, 
        isLoading: false 
      });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('subdomain');
    
    set({ 
      user: null, 
      isAuthenticated: false, 
      error: null 
    });

    // Redirect to main domain
    if (window.location.hostname === 'localhost') {
      window.location.href = 'http://localhost:5173';
    } else {
      window.location.href = `https://${import.meta.env.VITE_APP_DOMAIN}`;
    }
  }
}));

export default useAuthStore;
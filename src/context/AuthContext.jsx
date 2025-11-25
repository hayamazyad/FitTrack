import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '@/services/api';
import { toast } from 'sonner';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is logged in on mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      loadUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const loadUserProfile = async () => {
    try {
      const response = await authAPI.getMe();
      if (response.success && response.data?.user) {
        setUser(response.data.user);
        setIsAuthenticated(true);
      } else {
        throw new Error('Failed to load user profile');
      }
    } catch (error) {
      console.error('[v0] Failed to load user profile:', error);
      localStorage.removeItem('auth_token');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password);
      if (response.success && response.data) {
        const userData = response.data.user;
        
        // Validate that user data and name exist
        if (!userData || !userData.name) {
          console.error('Login response missing user data or name:', response);
          throw new Error('Invalid response from server - user data missing');
        }

        localStorage.setItem('auth_token', response.data.token);
        setUser(userData);
        setIsAuthenticated(true);
        
        // Show toast with user's name - guaranteed to exist at this point
        toast.success(`Welcome back, ${userData.name}!`);
        
        return { 
          success: true, 
          user: userData 
        };
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      toast.error(error.message || 'Login failed');
      return { 
        success: false, 
        message: error.message || 'Login failed',
        error: error.message 
      };
    }
  };

  const register = async (userData) => {
    try {
      const data = await authAPI.register(userData);
      toast.success('Account created successfully! Please log in.');
      return { success: true };
    } catch (error) {
      toast.error(error.message || 'Registration failed');
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
    setIsAuthenticated(false);
    toast.info('Logged out successfully');
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

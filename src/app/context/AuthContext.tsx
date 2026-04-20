import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI, usersAPI, setAuthToken, User } from '../services/api';

const ADMIN_SESSION_KEY = 'hms_admin_login_time';
const ADMIN_SESSION_TIMEOUT = 5 * 60 * 1000; // 5 minutes

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, allowAdmin?: boolean) => Promise<{ success: boolean; error?: string; user?: User }>;
  register: (data: { email: string; password: string; name: string; phone?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateUser: (data: { name: string; phone: string }) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Try to restore session on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('hms_token');
      if (token) {
        setAuthToken(token);
        try {
          const userData = await authAPI.me();
          // Admin/staff: only restore session if within 5-minute window
          if (userData.role === 'admin' || userData.role === 'staff') {
            const adminLoginTime = localStorage.getItem(ADMIN_SESSION_KEY);
            if (adminLoginTime && Date.now() - parseInt(adminLoginTime) < ADMIN_SESSION_TIMEOUT) {
              setUser(userData);
            } else {
              // Session expired
              localStorage.removeItem('hms_token');
              localStorage.removeItem(ADMIN_SESSION_KEY);
              setAuthToken(null);
            }
          } else {
            setUser(userData);
          }
        } catch (error) {
          // Token invalid or expired
          localStorage.removeItem('hms_token');
          localStorage.removeItem(ADMIN_SESSION_KEY);
          setAuthToken(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string, allowAdmin: boolean = false): Promise<{ success: boolean; error?: string; user?: User }> => {
    try {
      const tokenData = await authAPI.login({ email, password });
      localStorage.setItem('hms_token', tokenData.access_token);
      setAuthToken(tokenData.access_token);
      
      const userData = await authAPI.me();
      
      // Admin accounts should use the admin portal, not the customer interface
      if (userData.role === 'admin' && !allowAdmin) {
        localStorage.removeItem('hms_token');
        setAuthToken(null);
        throw new Error('Admin accounts must use the admin portal at /admin/login');
      }

      // Store admin/staff login timestamp for session persistence
      if (userData.role === 'admin' || userData.role === 'staff') {
        localStorage.setItem(ADMIN_SESSION_KEY, String(Date.now()));
      }
      
      setUser(userData);
      
      return { success: true, user: userData };
    } catch (error) {
      let errorMessage = 'Login failed';
      if (error instanceof Error) {
        try {
          const errorData = JSON.parse(error.message);
          errorMessage = errorData.detail || error.message;
        } catch {
          errorMessage = error.message;
        }
      }
      throw new Error(errorMessage);
    }
  };

  const register = async (data: { email: string; password: string; name: string; phone?: string }): Promise<{ success: boolean; error?: string }> => {
    try {
      await authAPI.register(data);
      // Auto-login after registration
      const loginResult = await login(data.email, data.password);
      return { success: loginResult.success, error: loginResult.error };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('hms_token');
    localStorage.removeItem(ADMIN_SESSION_KEY);
    setAuthToken(null);
  };

  const refreshUser = async () => {
    try {
      const userData = await authAPI.me();
      setUser(userData);
    } catch (error) {
      logout();
    }
  };

  const updateUser = async (data: { name: string; phone: string }): Promise<{ success: boolean; error?: string }> => {
    try {
      const updatedUser = await usersAPI.updateProfile(data);
      setUser(updatedUser);
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Update failed';
      return { success: false, error: errorMessage };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
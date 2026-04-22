import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI, usersAPI, setAuthToken, User } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  tokenType: 'admin' | 'regular' | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: User }>;
  adminLogin: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: User }>;
  register: (data: { email: string; password: string; name: string; phone?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateUser: (data: { name: string; phone: string }) => Promise<{ success: boolean; error?: string }>;
}



const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [tokenType, setTokenType] = useState<'admin' | 'regular' | null>(null);


  // Try to restore session on mount
  useEffect(() => {
    const initAuth = async () => {
      const adminToken = localStorage.getItem('hms_admin_token');
      const regularToken = localStorage.getItem('hms_token');
      
      let tokenToUse: string | null = null;
      let typeToUse: 'admin' | 'regular' | null = null;
      
      if (adminToken) {
        tokenToUse = adminToken;
        typeToUse = 'admin';
        localStorage.removeItem('hms_token'); // Clear conflicting
      } else if (regularToken) {
        tokenToUse = regularToken;
        typeToUse = 'regular';
      }
      
      if (tokenToUse) {
        setAuthToken(tokenToUse);
        try {
          const userData = await authAPI.me();
          
          // Role verification
          if (typeToUse === 'admin' && userData.role !== 'admin') {
            throw new Error('Invalid admin token');
          }
          if (typeToUse === 'regular' && userData.role === 'admin') {
            throw new Error('Admin must use admin portal');
          }
          
          setUser(userData);
          setTokenType(typeToUse);
        } catch (error) {
          localStorage.removeItem('hms_admin_token');
          localStorage.removeItem('hms_token');
          setAuthToken(null);
          setTokenType(null);
        }
      }
      
      setLoading(false);
    };
    initAuth();
  }, []);


  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string; user?: User }> => {
    try {
      const tokenData = await authAPI.login({ email, password });
      localStorage.setItem('hms_token', tokenData.access_token);
      setAuthToken(tokenData.access_token);
      
      const userData = await authAPI.me();
      
      // Admin accounts must use admin portal
      if (userData.role === 'admin') {
        localStorage.removeItem('hms_token');
        setAuthToken(null);
        throw new Error('Admin accounts must use the admin portal at /admin/login');
      }
      
      setUser(userData);
      setTokenType('regular');
      
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

  const adminLogin = async (email: string, password: string): Promise<{ success: boolean; error?: string; user?: User }> => {
    try {
      const tokenData = await authAPI.login({ email, password });
      localStorage.setItem('hms_admin_token', tokenData.access_token);  // Separate admin token
      setAuthToken(tokenData.access_token);
      
      const userData = await authAPI.me();
      
      // Verify admin role
      if (userData.role !== 'admin') {
        localStorage.removeItem('hms_admin_token');
        setAuthToken(null);
        throw new Error('Admin access required');
      }
      
      setUser(userData);
      setTokenType('admin');
      
      return { success: true, user: userData };

    } catch (error) {
      let errorMessage = 'Admin login failed';
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
    setTokenType(null);
    localStorage.removeItem('hms_token');
    localStorage.removeItem('hms_admin_token');
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
    <AuthContext.Provider value={{ user, loading, tokenType, login, adminLogin, register, logout, refreshUser, updateUser }}>
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

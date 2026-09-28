import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { api } from '../services/api';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, confirmPassword?: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (updatedData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('blogspace_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  const loadCurrentUser = useCallback(async () => {
    const storedToken = localStorage.getItem('blogspace_token');
    if (!storedToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.auth.getMe();
      if (res.success && res.user) {
        setUser(res.user);
      } else {
        localStorage.removeItem('blogspace_token');
        setToken(null);
        setUser(null);
      }
    } catch (err) {
      console.warn('Session expired or invalid token:', err);
      localStorage.removeItem('blogspace_token');
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCurrentUser();
  }, [loadCurrentUser]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await api.auth.login({ email, password });
      if (res.success && res.token && res.user) {
        localStorage.setItem('blogspace_token', res.token);
        setToken(res.token);
        setUser(res.user);
        toast.success(res.message || `Welcome back, ${res.user.name}!`);
        return true;
      }
      return false;
    } catch (err: any) {
      toast.error(err.message || 'Login failed. Please verify credentials.');
      return false;
    }
  };

  const register = async (name: string, email: string, password: string, confirmPassword?: string): Promise<boolean> => {
    try {
      const res = await api.auth.register({ name, email, password, confirmPassword });
      if (res.success && res.token && res.user) {
        localStorage.setItem('blogspace_token', res.token);
        setToken(res.token);
        setUser(res.user);
        toast.success(res.message || 'Registration successful!');
        return true;
      }
      return false;
    } catch (err: any) {
      toast.error(err.message || 'Registration failed.');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('blogspace_token');
    setToken(null);
    setUser(null);
    toast.info('You have been logged out.');
  };

  const updateUser = (updatedData: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updatedData } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

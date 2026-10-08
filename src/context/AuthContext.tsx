import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdminUser } from '../types';
import { api } from '../services/api';
import { safeStorage } from '../utils/storage';

interface AuthContextType {
  user: AdminUser | null;
  token: string | null;
  isLoading: boolean;
  isAdmin: boolean;
  isLoggedIn: boolean;
  initialAdminNeedsSetup: boolean;
  initialAdminEmail: string;
  login: (email: string, password: string) => Promise<{ success: boolean; needsSetup?: boolean; email?: string; user?: AdminUser }>;
  register: (name: string, email: string, password: string, confirmPassword?: string) => Promise<{ success: boolean; user?: AdminUser }>;
  setupInitialAdmin: (password: string, confirmPassword: string) => Promise<boolean>;
  updateProfile: (data: { name?: string; currentPassword?: string; newPassword?: string }) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(safeStorage.getItem('apex_auth_token'));
  const [isLoading, setIsLoading] = useState(true);
  const [initialAdminNeedsSetup, setInitialAdminNeedsSetup] = useState(false);
  const [initialAdminEmail, setInitialAdminEmail] = useState('myall5148@gmail.com');

  const isAdmin = Boolean(user && (user.role === 'admin' || user.role === 'superadmin'));
  const isLoggedIn = Boolean(user);

  const checkAuth = async () => {
    try {
      setIsLoading(true);

      // Check setup status
      const status = await api.getAuthStatus();
      setInitialAdminNeedsSetup(status.initialAdminNeedsSetup);
      setInitialAdminEmail(status.initialAdminEmail);

      const savedToken = safeStorage.getItem('apex_auth_token');
      if (savedToken) {
        const res = await api.getMe();
        setUser(res.user);
        setToken(savedToken);
      } else {
        setUser(null);
        setToken(null);
      }
    } catch {
      safeStorage.removeItem('apex_auth_token');
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await api.login({ email, password });
      if (res.token && res.user) {
        safeStorage.setItem('apex_auth_token', res.token);
        setToken(res.token);
        setUser(res.user);
        return { success: true, user: res.user };
      }
      return { success: false };
    } catch (err: any) {
      if (err.message?.includes('Initial administrator activation required')) {
        return { success: false, needsSetup: true, email: initialAdminEmail };
      }
      throw err;
    }
  };

  const register = async (name: string, email: string, password: string, confirmPassword?: string) => {
    const res = await api.register({ name, email, password, confirmPassword });
    if (res.token && res.user) {
      safeStorage.setItem('apex_auth_token', res.token);
      setToken(res.token);
      setUser(res.user);
      return { success: true, user: res.user };
    }
    return { success: false };
  };

  const setupInitialAdmin = async (password: string, confirmPassword: string) => {
    const res = await api.setupInitialAdmin({
      email: initialAdminEmail,
      password,
      confirmPassword
    });

    if (res.token && res.user) {
      safeStorage.setItem('apex_auth_token', res.token);
      setToken(res.token);
      setUser(res.user);
      setInitialAdminNeedsSetup(false);
      return true;
    }
    return false;
  };

  const updateProfile = async (data: { name?: string; currentPassword?: string; newPassword?: string }) => {
    const res = await api.updateUserProfile(data);
    if (res.user) {
      setUser(res.user);
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {}
    safeStorage.removeItem('apex_auth_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAdmin,
        isLoggedIn,
        initialAdminNeedsSetup,
        initialAdminEmail,
        login,
        register,
        setupInitialAdmin,
        updateProfile,
        logout,
        checkAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

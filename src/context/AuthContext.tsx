'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  api,
  getToken,
  setToken,
  getCurrentUser,
  setCurrentUser,
  logout as apiLogout,
} from '@/lib/api';
import toast from 'react-hot-toast';

export interface User {
  id: string;
  email: string;
  role: 'ADMIN' | 'STAFF' | 'STUDENT';
  firstName?: string;
  lastName?: string;
  department?: string;
  imageUrl?: string;
  isVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  updateProfile: (data: any, file?: File) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshUser = async () => {
    try {
      const { data } = await api.get<User>('/users/me');
      setUserState(data);
      setCurrentUser(data);
    } catch (err) {
      if (
        err instanceof Error &&
        (err.message.includes('Unauthorized') || err.message.includes('JWT'))
      ) {
        setUserState(null);
        apiLogout();
        router.push('/login');
      }
    }
  };

  useEffect(() => {
    const token = getToken();
    const cachedUser = getCurrentUser<User>();

    if (token && cachedUser) {
      setUserState(cachedUser);
      refreshUser().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // AuthContext.tsx এর login function এ এটা add করো temporarily
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data: res } = await api.post<{ access_token: string }>('/auth/login', {
        email,
        password,
      });

      setToken(res.access_token);

      const { data: profile } = await api.get<User>('/users/me');
      setUserState(profile);
      setCurrentUser(profile); // এটা role cookie set করে

      // ── DEBUG: cookie সেট হয়েছে কিনা দেখো ──
      console.log('cookies after login:', document.cookie);
      console.log('role from cookie:', profile.role);

      toast.success('Logged in successfully!');

      const dest =
        profile.role === 'ADMIN' ? '/admin'
          : profile.role === 'STAFF' ? '/staff'
            : '/student';

      // router.push এর বদলে hard redirect করো
      // এতে middleware fresh cookie দেখতে পাবে
      window.location.href = dest;

    } catch (err: any) {
      toast.error(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: any) => {
    try {
      const { data: res } = await api.post('/auth/register', data);
      toast.success(res.message || 'Registration successful. Please verify your email.');
      router.push('/login');
    } catch (err: any) {
      toast.error(err.message || 'Registration failed');
      throw err;
    }
  };

  const updateProfile = async (data: any, file?: File) => {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, val]) => {
        if (val !== undefined && val !== null) {
          formData.append(key, val as string);
        }
      });
      if (file) formData.append('file', file);

      const { data: updated } = await api.patch<User>('/auth/profile', formData);
      setUserState(updated);
      setCurrentUser(updated);
      toast.success('Profile updated successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Profile update failed');
      throw err;
    }
  };

  const logout = () => {
    setUserState(null);
    apiLogout();
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, updateProfile, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { fetchAPI, getToken, setToken, getCurrentUser, setCurrentUser, logout as apiLogout } from '@/lib/api';
import toast from 'react-hot-toast';

export interface User {
  id: string;
  email: string;
  role: 'ADMIN' | 'EDITOR' | 'VIEWER';
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
  const pathname = usePathname();

  const refreshUser = async () => {
    try {
      const updatedUser = await fetchAPI('/users/me');
      setUserState(updatedUser);
      setCurrentUser(updatedUser);
    } catch (err) {
      console.error('Failed to refresh user profile:', err);
      // Don't log out immediately if offline/network error, but clear state if unauthorised (401/403)
      if (err instanceof Error && (err.message.includes('Unauthorized') || err.message.includes('JWT'))) {
        setUserState(null);
        apiLogout();
      }
    }
  };

  useEffect(() => {
    const token = getToken();
    const cachedUser = getCurrentUser();

    if (token && cachedUser) {
      setUserState(cachedUser);
      // Fetch fresh data in the background
      refreshUser().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // Simple route guard check
  useEffect(() => {
    if (loading) return;
    
    const authPaths = ['/login', '/register', '/verify', '/forgot-password', '/reset-password'];
    const publicPaths = [...authPaths, '/about', '/contact', '/devices', '/cart', '/checkout', '/payment-success', '/payment-cancelled'];
    const isPublicPath = pathname === '/' || publicPaths.some(path => pathname.startsWith(path));
    const isAuthPath = authPaths.some(path => pathname.startsWith(path));
    const token = getToken();
    const dashboardForRole = user?.role === 'ADMIN' ? '/admin' : user?.role === 'EDITOR' ? '/editor' : '/viewer';

    if (!token && !isPublicPath) {
      router.push('/login');
    } else if (token && isAuthPath) {
      router.push(dashboardForRole);
    } else if (token && pathname.startsWith('/dashboard')) {
      router.push(dashboardForRole);
    } else if (token && pathname.startsWith('/admin') && user?.role !== 'ADMIN') {
      router.push(dashboardForRole);
      toast.error('Access Denied: Admin role required');
    } else if (token && pathname.startsWith('/editor') && user?.role !== 'EDITOR') {
      router.push(dashboardForRole);
      toast.error('Access Denied: Editor role required');
    } else if (token && pathname.startsWith('/viewer') && user?.role !== 'VIEWER') {
      router.push(dashboardForRole);
      toast.error('Access Denied: Viewer role required');
    }
  }, [user, loading, pathname, router]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await fetchAPI('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setToken(res.access_token || res.accessToken);
      
      // Fetch user profile immediately
      const profile = await fetchAPI('/users/me');
      setUserState(profile);
      setCurrentUser(profile);
      
      toast.success('Logged in successfully!');
      
      router.push(profile.role === 'ADMIN' ? '/admin' : profile.role === 'EDITOR' ? '/editor' : '/viewer');
    } catch (err: any) {
      toast.error(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: any) => {
    try {
      const res = await fetchAPI('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      toast.success(res.message || 'Registration successful. Please verify email.');
      router.push('/login');
    } catch (err: any) {
      toast.error(err.message || 'Registration failed');
      throw err;
    }
  };

  const updateProfile = async (data: any, file?: File) => {
    try {
      const formData = new FormData();
      Object.keys(data).forEach((key) => {
        if (data[key] !== undefined && data[key] !== null) {
          formData.append(key, data[key]);
        }
      });
      if (file) {
        formData.append('file', file);
      }

      const updatedUser = await fetchAPI('/auth/profile', {
        method: 'PATCH',
        body: formData,
      });

      setUserState(updatedUser);
      setCurrentUser(updatedUser);
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
    <AuthContext.Provider value={{ user, loading, login, register, updateProfile, logout, refreshUser }}>
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

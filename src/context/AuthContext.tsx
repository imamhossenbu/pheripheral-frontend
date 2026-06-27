/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  api,
  getClientToken,
  setToken,
  getCurrentUser,
  setCurrentUser,
  logout as apiLogout,
} from "@/lib/api";
import toast from "react-hot-toast";

export interface User {
  id: string;
  email: string;
  role: "ADMIN" | "STAFF" | "STUDENT";
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
      const { data } = await api.get<User>("/users/me");
      setUserState(data);
      setCurrentUser(data);
    } catch (err: any) {
      if (err?.response?.status === 401) {
        setUserState(null);
        apiLogout();
      }
    }
  };

  useEffect(() => {
    const token = getClientToken();
    const cachedUser = getCurrentUser<User>();
    if (token && cachedUser) {
      setUserState(cachedUser);
      refreshUser().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data: res } = await api.post<{ access_token: string }>(
        "/auth/login",
        { email, password },
      );
      setToken(res.access_token);
      const { data: profile } = await api.get<User>("/users/me");
      setUserState(profile);
      setCurrentUser(profile);
      window.location.href =
        profile.role === "ADMIN"
          ? "/admin"
          : profile.role === "STAFF"
            ? "/staff"
            : "/student";
    } catch (err: any) {
      toast.error(err.message || "Login failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: any, file?: File) => {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, val]) => {
        if (val !== undefined && val !== null)
          formData.append(key, val as string);
      });
      if (file) formData.append("file", file);

      const { data: updated } = await api.patch<User>(
        "/auth/profile",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      setUserState(updated);
      setCurrentUser(updated);
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Profile update failed");
      throw err;
    }
  };

  const logout = () => {
    setUserState(null);
    apiLogout();
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        updateProfile,
        logout,
        refreshUser,
        register: async () => {},
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

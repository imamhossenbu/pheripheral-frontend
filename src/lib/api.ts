/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// =========================
// TOKEN
// =========================

export function getClientToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export async function getServerToken(): Promise<string | null> {
  try {
    const { cookies } = await import("next/headers");
    return (await cookies()).get("token")?.value || null;
  } catch {
    return null;
  }
}

// =========================
// USER
// =========================

export function getCurrentUser<T = any>(): T | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setCurrentUser(user: any) {
  if (typeof window === "undefined") return;

  if (user) {
    localStorage.setItem("user", JSON.stringify(user));

    document.cookie = `role=${user.role}; path=/; max-age=${
      60 * 60 * 24 * 7
    }; SameSite=Lax`;
  } else {
    localStorage.removeItem("user");
    document.cookie = "role=; path=/; max-age=0";
  }
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;

  if (token) {
    localStorage.setItem("token", token);

    document.cookie = `token=${token}; path=/; max-age=${
      60 * 60 * 24 * 7
    }; SameSite=Lax`;
  } else {
    localStorage.removeItem("token");
    document.cookie = "token=; path=/; max-age=0";
  }
}

export function logout() {
  setToken(null);
  setCurrentUser(null);

  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}

// =========================
// CLIENT API
// =========================

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = getClientToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }

  return config;
});

api.interceptors.response.use(
  (res: AxiosResponse) => res,
  (error) => {
    const msg =
      error?.response?.data?.message ||
      error?.response?.data ||
      error?.message ||
      "Something went wrong";

    return Promise.reject(
      new Error(Array.isArray(msg) ? msg.join(", ") : String(msg)),
    );
  },
);

// =========================
// CLIENT FETCH
// =========================

export async function fetchAPI<T = any>(
  path: string,
  options: AxiosRequestConfig = {},
): Promise<T> {
  const res = await api.request<T>({
    url: path,
    ...options,
  });

  return res.data;
}

// =========================
// SERVER FETCH
// =========================

export async function serverFetchAPI<T = any>(
  path: string,
  options: AxiosRequestConfig = {},
): Promise<T> {
  const token = await getServerToken();

  const res = await axios.request<T>({
    baseURL: BASE_URL,
    url: path,
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      ...(options.headers || {}),
    },
    ...options,
  });

  return res.data;
}

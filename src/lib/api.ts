import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// ─── TOKEN & USER ──────────────────────────────────────────────────────────────

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem("token", token);
    document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
  } else {
    localStorage.removeItem("token");
    document.cookie = "token=; path=/; max-age=0";
  }
}

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
    document.cookie = `role=${user.role}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
  } else {
    localStorage.removeItem("user");
    document.cookie = "role=; path=/; max-age=0";
  }
}

export function logout() {
  setToken(null);
  setCurrentUser(null);
  if (typeof window !== "undefined") window.location.href = "/login";
}

// ─── AXIOS INSTANCE ────────────────────────────────────────────────────────────

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Request interceptor — token inject
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }
  return config;
});

// Response interceptor — error normalize
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

// ─── GENERIC HELPER ────────────────────────────────────────────────────────────

export async function fetchAPI<T = any>(
  path: string,
  options: AxiosRequestConfig = {},
): Promise<T> {
  const res = await api.request<T>({ url: path, ...options });
  return res.data;
}

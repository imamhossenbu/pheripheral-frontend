// lib/api/OrderApi.ts
import { fetchAPI, serverFetchAPI, api } from "@/lib/api";

// ─── TYPES ────────────────────────────────────────────────────────────────────

export type OrderStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "CANCELLED";
export type PaymentStatus = "UNPAID" | "PARTIAL" | "PAID" | "REFUNDED";

export interface OrderItem {
  id: string;
  deviceId: string;
  quantity: number;
  unitPrice: number;
  total: number;
  device: {
    id: string;
    name: string;
    brand: string;
    model: string;
    images: { url: string; isPrimary: boolean }[];
  };
  variant?: { id: string; name: string } | null;
}

export interface Payment {
  id: string;
  amount: number;
  method: string;
  status: string;
  transactionId?: string;
  paidAt?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    department?: string | null;
  };
  items: OrderItem[];
  payments: Payment[];
}

export interface OrderListResponse {
  data: Order[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ─── SERVICE ──────────────────────────────────────────────────────────────────

export const orderService = {
  // Server Components — serverFetchAPI cookie দিয়ে token নেয়
  getAll: (query: string): Promise<OrderListResponse> =>
    serverFetchAPI(`/orders?${query}`),

  getOne: (id: string): Promise<Order> => serverFetchAPI(`/orders/${id}`),

  // Client Components — axios interceptor token inject করে
  update: (id: string, data: any): Promise<Order> =>
    fetchAPI(`/orders/${id}`, { method: "PATCH", data }),

  delete: (id: string) => fetchAPI(`/orders/${id}`, { method: "DELETE" }),

  // PDF invoice download
  downloadInvoice: async (id: string, orderNumber: string): Promise<void> => {
    const token = localStorage.getItem("token");
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/orders/${id}/invoice`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    if (!res.ok) throw new Error("Failed to download invoice");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice-${orderNumber}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  },
};

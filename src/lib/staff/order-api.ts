import { fetchAPI, serverFetchAPI } from "@/lib/api";

// ─── Enums ────────────────────────────────────────────────────────────────────

export type OrderStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "CANCELLED";
export type PaymentStatus = "UNPAID" | "PARTIAL" | "PAID" | "REFUNDED";
export type TrackingStage =
  | "PLACED"
  | "PREPARING"
  | "OUT_FOR_DELIVERY"
  | "ARRIVED"
  | "DELIVERED";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface OrderUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  department: string | null;
}

export interface OrderDevice {
  id: string;
  name: string;
  brand: string;
  imageUrl?: string | null;
}

export interface OrderItem {
  id: string;
  deviceId: string;
  variantId: string | null;
  quantity: number;
  unitPrice: number | string;
  total: number | string;
  device: OrderDevice;
  variant: { id: string; name: string; sku: string | null } | null;
}

export interface TrackingStaff {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
}

export interface OrderTracking {
  id: string;
  orderId: string;
  staffId: string;
  latitude: number;
  longitude: number;
  stage: TrackingStage;
  note: string | null;
  recordedAt: string;
  staff: TrackingStaff;
}

export interface OrderMessage {
  id: string;
  orderId: string;
  senderId: string;
  message: string;
  createdAt: string;
  sender: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    role: string;
  };
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  subtotal: number | string;
  discount: number | string;
  tax: number | string;
  total: number | string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  user: OrderUser;
  items: OrderItem[];
  trackingUpdates: OrderTracking[];
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface OrdersResponse {
  data: Order[];
  meta: PaginationMeta;
}

export interface OrderQueryParams {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  userId?: string;
}

export interface UpdateOrderPayload {
  status?: OrderStatus;
  notes?: string;
}

export interface PostTrackingPayload {
  latitude: number;
  longitude: number;
  stage: TrackingStage;
  note?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildQuery(params: Record<string, any>): string {
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== "",
  );
  if (!entries.length) return "";
  return "?" + new URLSearchParams(entries as [string, string][]).toString();
}

// ─── Server-side ──────────────────────────────────────────────────────────────

export async function fetchOrders(
  params: OrderQueryParams,
): Promise<OrdersResponse> {
  return serverFetchAPI<OrdersResponse>(`/orders${buildQuery(params)}`);
}

export async function fetchOrder(id: string): Promise<Order> {
  return serverFetchAPI<Order>(`/orders/${id}`);
}

export interface SendMessagePayload {
  message: string;
}

export async function sendMessage(
  orderId: string,
  payload: SendMessagePayload,
): Promise<OrderMessage> {
  return fetchAPI<OrderMessage>(`/orders/${orderId}/messages`, {
    method: "POST",
    data: payload,
  });
}

// ─── Client-side ──────────────────────────────────────────────────────────────

export async function clientFetchOrder(id: string): Promise<Order> {
  return fetchAPI<Order>(`/orders/${id}`);
}

export async function updateOrder(
  id: string,
  payload: UpdateOrderPayload,
): Promise<Order> {
  return fetchAPI<Order>(`/orders/${id}`, { method: "PATCH", data: payload });
}

export async function deleteOrder(id: string): Promise<{ message: string }> {
  return fetchAPI(`/orders/${id}`, { method: "DELETE" });
}

export async function postTracking(
  orderId: string,
  payload: PostTrackingPayload,
): Promise<OrderTracking> {
  return fetchAPI<OrderTracking>(`/orders/${orderId}/tracking`, {
    method: "POST",
    data: {
      orderId,
      ...payload,
    },
  });
}

export async function fetchTrackingHistory(
  orderId: string,
): Promise<OrderTracking[]> {
  return fetchAPI<OrderTracking[]>(`/orders/${orderId}/tracking`);
}

export async function fetchMessages(
  orderId: string,
  limit?: number,
): Promise<OrderMessage[]> {
  const q = limit ? `?limit=${limit}` : "";
  return fetchAPI<OrderMessage[]>(`/orders/${orderId}/messages${q}`);
}

// ─── Display helpers ──────────────────────────────────────────────────────────

export function formatCurrency(v: number | string): string {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    minimumFractionDigits: 2,
  }).format(Number(v));
}

export function formatDate(v: string | null): string {
  if (!v) return "—";
  return new Intl.DateTimeFormat("en-BD", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(v));
}

export function formatRelative(v: string): string {
  const diff = Date.now() - new Date(v).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return formatDate(v);
}

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "Pending",
  PROCESSING: "Processing",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const ORDER_STATUS_BADGE: Record<OrderStatus, string> = {
  PENDING: "badge badge-warning",
  PROCESSING: "badge badge-info",
  COMPLETED: "badge badge-success",
  CANCELLED: "badge badge-danger",
};

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  UNPAID: "Unpaid",
  PARTIAL: "Partial",
  PAID: "Paid",
  REFUNDED: "Refunded",
};

export const PAYMENT_STATUS_BADGE: Record<PaymentStatus, string> = {
  UNPAID: "badge badge-danger",
  PARTIAL: "badge badge-warning",
  PAID: "badge badge-success",
  REFUNDED: "badge badge-info",
};

export const TRACKING_STAGE_LABEL: Record<TrackingStage, string> = {
  PLACED: "Order Placed",
  PREPARING: "Preparing",
  OUT_FOR_DELIVERY: "Out for Delivery",
  ARRIVED: "Arrived",
  DELIVERED: "Delivered",
};

export const TRACKING_STAGES: TrackingStage[] = [
  "PLACED",
  "PREPARING",
  "OUT_FOR_DELIVERY",
  "ARRIVED",
  "DELIVERED",
];

import { fetchAPI, serverFetchAPI } from "@/lib/api";

// ─── Enums (no Prisma dependency) ─────────────────────────────────────────────

export type PaymentMethod =
  | "CARD"
  | "CASH"
  | "BANK_TRANSFER"
  | "MOBILE_BANKING"
  | "CHEQUE";

export type PaymentTransactionStatus =
  | "PENDING"
  | "SUCCESS"
  | "FAILED"
  | "REFUNDED";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PaymentUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  department: string | null;
}

export interface PaymentOrder {
  id: string;
  orderNumber: string;
  total: number | string;
  paymentStatus: string;
}

export interface Payment {
  id: string;
  orderId: string;
  userId: string;
  amount: number | string;
  method: PaymentMethod;
  status: PaymentTransactionStatus;
  transactionId: string | null;
  provider: string | null;
  paidAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  order: PaymentOrder;
  user: PaymentUser;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaymentsResponse {
  data: Payment[];
  meta: PaginationMeta;
}

export interface PaymentQueryParams {
  page?: number;
  limit?: number;
  orderId?: string;
  userId?: string;
  status?: PaymentTransactionStatus;
  method?: PaymentMethod;
}

export interface UpdatePaymentPayload {
  amount?: number;
  method?: PaymentMethod;
  status?: PaymentTransactionStatus;
  transactionId?: string;
  provider?: string;
  paidAt?: string;
  notes?: string;
}

// ─── Query builder ────────────────────────────────────────────────────────────

function buildQuery(params: PaymentQueryParams): string {
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== "",
  );
  if (!entries.length) return "";
  return "?" + new URLSearchParams(entries as [string, string][]).toString();
}

// ─── Server-side (Server Components) ─────────────────────────────────────────

export async function fetchPayments(
  params: PaymentQueryParams,
): Promise<PaymentsResponse> {
  return serverFetchAPI<PaymentsResponse>(`/payments${buildQuery(params)}`);
}

export async function fetchPayment(id: string): Promise<Payment> {
  return serverFetchAPI<Payment>(`/payments/${id}`);
}

// ─── Client-side (Client Components) ─────────────────────────────────────────

export async function clientFetchPayment(id: string): Promise<Payment> {
  return fetchAPI<Payment>(`/payments/${id}`);
}

export async function updatePayment(
  id: string,
  payload: UpdatePaymentPayload,
): Promise<Payment> {
  return fetchAPI<Payment>(`/payments/${id}`, {
    method: "PATCH",
    data: payload,
  });
}

export async function deletePayment(
  id: string,
): Promise<{ message: string; id: string }> {
  return fetchAPI<{ message: string; id: string }>(`/payments/${id}`, {
    method: "DELETE",
  });
}

// ─── Display helpers ──────────────────────────────────────────────────────────

export function formatCurrency(amount: number | string): string {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    minimumFractionDigits: 2,
  }).format(Number(amount));
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Intl.DateTimeFormat("en-BD", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dateStr));
}

export const STATUS_LABELS: Record<PaymentTransactionStatus, string> = {
  PENDING: "Pending",
  SUCCESS: "Success",
  FAILED: "Failed",
  REFUNDED: "Refunded",
};

export const METHOD_LABELS: Record<PaymentMethod, string> = {
  CARD: "Card",
  CASH: "Cash",
  BANK_TRANSFER: "Bank Transfer",
  MOBILE_BANKING: "Mobile Banking",
  CHEQUE: "Cheque",
};

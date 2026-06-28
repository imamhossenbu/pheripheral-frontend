import { fetchAPI, serverFetchAPI } from '@/lib/api';

// ─── Enums ────────────────────────────────────────────────────────────────────

export type BorrowStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'RETURNED';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BorrowDevice {
  id: string;
  name: string;
  brand: string;
  model: string;
  imageUrl?: string | null;
}

export interface BorrowUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  department: string | null;
}

export interface BorrowRequest {
  id: string;
  deviceId: string;
  userId: string;
  variantId: string | null;
  startDate: string;
  endDate: string;
  reason: string;
  status: BorrowStatus;
  adminNote: string | null;
  returnedAt: string | null;
  createdAt: string;
  updatedAt: string;
  device: BorrowDevice;
  user: BorrowUser;
  variant: { id: string; name: string } | null;
}

export interface BorrowsResponse {
  data: BorrowRequest[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface BorrowQueryParams {
  page?: number;
  limit?: number;
  status?: BorrowStatus;
  userId?: string;
  deviceId?: string;
}

export interface ReviewBorrowPayload {
  status: 'APPROVED' | 'REJECTED';
  adminNote?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildQuery(params: Record<string, any>): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== '');
  if (!entries.length) return '';
  return '?' + new URLSearchParams(entries as [string, string][]).toString();
}

// ─── Server-side ──────────────────────────────────────────────────────────────

export async function fetchBorrows(params: BorrowQueryParams): Promise<BorrowsResponse> {
  return serverFetchAPI<BorrowsResponse>(`/borrow-requests${buildQuery(params)}`);
}

export async function fetchBorrow(id: string): Promise<BorrowRequest> {
  return serverFetchAPI<BorrowRequest>(`/borrow-requests/${id}`);
}

// ─── Client-side ──────────────────────────────────────────────────────────────

export async function clientFetchBorrow(id: string): Promise<BorrowRequest> {
  return fetchAPI<BorrowRequest>(`/borrow-requests/${id}`);
}

export async function reviewBorrow(
  id: string,
  payload: ReviewBorrowPayload,
): Promise<BorrowRequest> {
  return fetchAPI<BorrowRequest>(`/borrow-requests/${id}/review`, {
    method: 'PATCH',
    data: payload,
  });
}

// ─── Display helpers ──────────────────────────────────────────────────────────

export function formatDate(v: string | null): string {
  if (!v) return '—';
  return new Intl.DateTimeFormat('en-BD', { dateStyle: 'medium' }).format(new Date(v));
}

export const BORROW_STATUS_LABEL: Record<BorrowStatus, string> = {
  PENDING: 'Pending', APPROVED: 'Approved',
  REJECTED: 'Rejected', RETURNED: 'Returned',
};

export const BORROW_STATUS_BADGE: Record<BorrowStatus, string> = {
  PENDING:  'badge badge-warning',
  APPROVED: 'badge badge-success',
  REJECTED: 'badge badge-danger',
  RETURNED: 'badge badge-info',
};
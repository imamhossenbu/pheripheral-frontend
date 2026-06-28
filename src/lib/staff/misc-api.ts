import { fetchAPI, serverFetchAPI } from '@/lib/api';

// ═══════════════════════════════════════════════════════════
// CATEGORY API
// ═══════════════════════════════════════════════════════════

export interface Category {
  id: string;
  name: string;
  parentId: string | null;
  parent: { id: string; name: string } | null;
  subCategories: { id: string; name: string }[];
  _count?: { devices: number };
}

export interface CategoriesResponse {
  data: Category[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface CategoryQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  parentId?: string;
}

export interface CategoryPayload {
  name: string;
  parentId?: string | null;
}

function buildQuery(params: Record<string, any>): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== '');
  if (!entries.length) return '';
  return '?' + new URLSearchParams(entries as [string, string][]).toString();
}

export async function fetchCategories(params: CategoryQueryParams = {}): Promise<CategoriesResponse> {
  return serverFetchAPI<CategoriesResponse>(`/categories${buildQuery(params)}`);
}

export async function clientFetchCategories(): Promise<CategoriesResponse> {
  return fetchAPI<CategoriesResponse>('/categories');
}

export async function createCategory(payload: CategoryPayload): Promise<Category> {
  return fetchAPI<Category>('/categories', { method: 'POST', data: payload });
}

export async function updateCategory(id: string, payload: CategoryPayload): Promise<Category> {
  return fetchAPI<Category>(`/categories/${id}`, { method: 'PATCH', data: payload });
}

export async function deleteCategory(id: string): Promise<{ message: string }> {
  return fetchAPI(`/categories/${id}`, { method: 'DELETE' });
}

// ═══════════════════════════════════════════════════════════
// REVIEW API
// ═══════════════════════════════════════════════════════════

export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface DeviceReview {
  id: string;
  deviceId: string;
  userId: string;
  borrowRequestId: string;
  rating: number;
  comment: string | null;
  status: ReviewStatus;
  createdAt: string;
  updatedAt: string;
  device: { id: string; name: string; brand: string };
  user: { id: string; email: string; firstName: string | null; lastName: string | null };
}

export interface ReviewsResponse {
  data: DeviceReview[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface ReviewQueryParams {
  page?: number;
  limit?: number;
  status?: ReviewStatus;
  deviceId?: string;
}

export async function fetchReviews(params: ReviewQueryParams = {}): Promise<ReviewsResponse> {
  return serverFetchAPI<ReviewsResponse>(`/reviews${buildQuery(params)}`);
}

export async function moderateReview(
  id: string,
  payload: { status: 'APPROVED' | 'REJECTED' },
): Promise<DeviceReview> {
  return fetchAPI<DeviceReview>(`/reviews/${id}/moderate`, { method: 'PATCH', data: payload });
}

export async function deleteReview(id: string): Promise<{ message: string }> {
  return fetchAPI(`/reviews/${id}`, { method: 'DELETE' });
}

export const REVIEW_STATUS_LABEL: Record<ReviewStatus, string> = {
  PENDING: 'Pending', APPROVED: 'Approved', REJECTED: 'Rejected',
};
export const REVIEW_STATUS_BADGE: Record<ReviewStatus, string> = {
  PENDING: 'badge badge-warning', APPROVED: 'badge badge-success', REJECTED: 'badge badge-danger',
};

// ═══════════════════════════════════════════════════════════
// FINE API
// ═══════════════════════════════════════════════════════════

export type FineStatus = 'UNPAID' | 'PAID' | 'WAIVED';

export interface Fine {
  id: string;
  borrowRequestId: string;
  userId: string;
  amount: number | string;
  reason: string;
  status: FineStatus;
  paidAt: string | null;
  waivedBy: string | null;
  waivedAt: string | null;
  waivedReason: string | null;
  createdAt: string;
  updatedAt: string;
  user: { id: string; email: string; firstName: string | null; lastName: string | null };
  borrowRequest: { id: string; device: { name: string } };
}

export interface FinesResponse {
  data: Fine[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface FineQueryParams {
  page?: number;
  limit?: number;
  status?: FineStatus;
  userId?: string;
}

export async function fetchFines(params: FineQueryParams = {}): Promise<FinesResponse> {
  return serverFetchAPI<FinesResponse>(`/fines${buildQuery(params)}`);
}

export async function waiveFine(
  id: string,
  payload: { reason: string },
): Promise<Fine> {
  return fetchAPI<Fine>(`/fines/${id}/waive`, { method: 'PATCH', data: payload });
}

export function formatCurrency(v: number | string): string {
  return new Intl.NumberFormat('en-BD', {
    style: 'currency', currency: 'BDT', minimumFractionDigits: 2,
  }).format(Number(v));
}

export function formatDate(v: string | null): string {
  if (!v) return '—';
  return new Intl.DateTimeFormat('en-BD', { dateStyle: 'medium' }).format(new Date(v));
}

export const FINE_STATUS_LABEL: Record<FineStatus, string> = {
  UNPAID: 'Unpaid', PAID: 'Paid', WAIVED: 'Waived',
};
export const FINE_STATUS_BADGE: Record<FineStatus, string> = {
  UNPAID: 'badge badge-danger', PAID: 'badge badge-success', WAIVED: 'badge badge-info',
};
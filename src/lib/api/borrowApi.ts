import { fetchAPI, serverFetchAPI } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

export type BorrowStatus = "PENDING" | "APPROVED" | "REJECTED" | "RETURNED";

export interface BorrowRequestQueryDto {
  page?: number;
  limit?: number;
  status?: BorrowStatus;
  userId?: string;
  deviceId?: string;
}

export interface CreateBorrowRequestDto {
  deviceId: string;
  variantId?: string;
  startDate: string;
  endDate: string;
  reason: string;
}

export interface ReviewBorrowRequestDto {
  status: "APPROVED" | "REJECTED";
  adminNote?: string;
}

export interface BorrowRequestResponse {
  id: string;
  userId: string;
  deviceId: string;
  variantId?: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: BorrowStatus;
  adminNote?: string;
  returnedAt?: string;
  createdAt: string;
  device: {
    id: string;
    name: string;
    category: { id: string; name: string };
  };
  variant?: { id: string; name: string };
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface PaginatedBorrowResponse {
  data: BorrowRequestResponse[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ─── Query string builder ─────────────────────────────────────────────────────

function buildQuery(query: BorrowRequestQueryDto = {}): string {
  const params: Record<string, string> = {};
  Object.entries(query).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") params[k] = String(v);
  });
  const qs = new URLSearchParams(params).toString();
  return qs ? `?${qs}` : "";
}

// ─── Server-side (Server Components / RSC) ────────────────────────────────────

export const borrowApiServer = {
  // Admin only — সব requests
  findAll: (query: BorrowRequestQueryDto = {}) =>
    serverFetchAPI<PaginatedBorrowResponse>(
      `/borrow-requests${buildQuery(query)}`,
    ),

  // Admin: একটা specific request
  findOne: (id: string) =>
    serverFetchAPI<BorrowRequestResponse>(`/borrow-requests/${id}`),
};

// ─── Client-side (Client Components / actions) ────────────────────────────────

export const borrowApiClient = {
  // Student: নিজের requests — GET /borrow-requests/my
  getMyRequests: (query: BorrowRequestQueryDto = {}) =>
    fetchAPI<PaginatedBorrowResponse>(
      `/borrow-requests/my${buildQuery(query)}`,
    ),

  // Student: নতুন borrow request
  create: (dto: CreateBorrowRequestDto) =>
    fetchAPI<BorrowRequestResponse>("/borrow-requests", {
      method: "POST",
      data: dto,
    }),

  // Admin: approve / reject
  review: (id: string, dto: ReviewBorrowRequestDto) =>
    fetchAPI<BorrowRequestResponse>(`/borrow-requests/${id}/review`, {
      method: "PATCH",
      data: dto,
    }),

  // Student: device return
  returnDevice: (id: string) =>
    fetchAPI<{ message: string; data: BorrowRequestResponse }>(
      `/borrow-requests/${id}/return`,
      { method: "PATCH" },
    ),
};

/* eslint-disable @typescript-eslint/no-explicit-any */
import { fetchAPI, serverFetchAPI } from "@/lib/api";

export interface BorrowRequestQueryDto {
  page?: number;
  limit?: number;
  status?: "PENDING" | "APPROVED" | "REJECTED" | "RETURNED";
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
  status: "PENDING" | "APPROVED" | "REJECTED" | "RETURNED";
  adminNote?: string;
  returnedAt?: string;
  createdAt: string;
  device: {
    id: string;
    name: string;
    category: { id: string; name: string };
  };
  variant?: {
    id: string;
    name: string;
  };
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

// ==========================================
// SERVER-SIDE API CALLS (For Server Component)
// ==========================================
export const borrowApiServer = {
  findAll: (query: BorrowRequestQueryDto = {}) => {
    const cleanQuery: Record<string, string> = {};
    Object.entries(query).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        cleanQuery[key] = String(val);
      }
    });

    const params = new URLSearchParams(cleanQuery).toString();
    const path = params ? `/borrow-requests?${params}` : "/borrow-requests";

    return serverFetchAPI<PaginatedBorrowResponse>(path, { method: "GET" });
  },
};

// ==========================================
// CLIENT-SIDE API CALLS (For Actions/Mutations)
// ==========================================
export const borrowApiClient = {
  create: (dto: CreateBorrowRequestDto) => {
    return fetchAPI<BorrowRequestResponse>("/borrow-requests", {
      method: "POST",
      data: dto,
    });
  },

  review: (id: string, dto: ReviewBorrowRequestDto) => {
    return fetchAPI<BorrowRequestResponse>(`/borrow-requests/${id}/review`, {
      method: "PATCH",
      data: dto,
    });
  },

  returnDevice: (id: string) => {
    return fetchAPI<{ message: string; data: BorrowRequestResponse }>(
      `/borrow-requests/${id}/return`,
      {
        method: "PATCH",
      },
    );
  },
};

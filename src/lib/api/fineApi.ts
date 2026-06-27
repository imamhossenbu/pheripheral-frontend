/* eslint-disable @typescript-eslint/no-explicit-any */
import { fetchAPI, serverFetchAPI } from "@/lib/api";

export interface FineQueryDto {
  page?: number;
  limit?: number;
  userId?: string;
  status?: "UNPAID" | "PAID" | "WAIVED";
}

export interface CreateFineDto {
  borrowRequestId: string;
  amount: number;
  reason: string;
}

export interface WaiveFineDto {
  waivedReason: string;
}

export interface PayFineDto {
  notes?: string;
}

export interface FineResponse {
  id: string;
  borrowRequestId: string;
  userId: string;
  amount: number;
  reason: string;
  status: "UNPAID" | "PAID" | "WAIVED";
  createdAt: string;
  paidAt?: string;
  waivedAt?: string;
  waivedReason?: string;
  waivedBy?: string;
  borrowRequest: {
    id: string;
    device: {
      id: string;
      name: string;
    };
  };
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface PaginatedFineResponse {
  data: FineResponse[];
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
export const fineApiServer = {
  findAll: (query: FineQueryDto = {}) => {
    // 💡 FIX: undefined বা null ভ্যালুগুলো বাদ দিয়ে শুধু ভ্যালিড ফিল্টার ক্লিন করা হচ্ছে
    const cleanQuery: Record<string, string> = {};
    Object.entries(query).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        cleanQuery[key] = String(val);
      }
    });

    const params = new URLSearchParams(cleanQuery).toString();
    const path = params ? `/fines?${params}` : "/fines";

    return serverFetchAPI<PaginatedFineResponse>(path, {
      method: "GET",
    });
  },

  findOne: (id: string) => {
    return serverFetchAPI<FineResponse>(`/fines/${id}`, { method: "GET" });
  },
};

// ==========================================
// CLIENT-SIDE API CALLS (For Actions/Mutations)
// ==========================================
export const fineApiClient = {
  create: (dto: CreateFineDto) => {
    return fetchAPI<FineResponse>("/fines", { method: "POST", data: dto });
  },

  pay: (id: string, dto: PayFineDto = {}) => {
    return fetchAPI<FineResponse>(`/fines/${id}/pay`, {
      method: "PATCH",
      data: dto,
    });
  },

  waive: (id: string, dto: WaiveFineDto) => {
    return fetchAPI<FineResponse>(`/fines/${id}/waive`, {
      method: "PATCH",
      data: dto,
    });
  },
};

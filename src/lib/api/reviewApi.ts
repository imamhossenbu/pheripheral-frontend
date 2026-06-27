import { fetchAPI, serverFetchAPI } from "@/lib/api";

const isServer = typeof window === "undefined";
const api = (path: string) =>
  isServer ? serverFetchAPI(path) : fetchAPI(path);

export enum ReviewStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

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
  device: { id: string; name: string };
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
}

export interface ReviewsResponse {
  data: DeviceReview[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ReviewQuery {
  page?: number;
  limit?: number;
  deviceId?: string;
  userId?: string;
  status?: ReviewStatus;
}

function buildQuery(q: ReviewQuery): string {
  const p = new URLSearchParams();
  if (q.page) p.set("page", String(q.page));
  if (q.limit) p.set("limit", String(q.limit));
  if (q.deviceId) p.set("deviceId", q.deviceId);
  if (q.userId) p.set("userId", q.userId);
  if (q.status) p.set("status", q.status);
  return p.toString();
}

export const reviewService = {
  // Admin: all reviews with optional filters
  getAll: (query: ReviewQuery = {}): Promise<ReviewsResponse> =>
    api(`/reviews?${buildQuery(query)}`),

  // Admin: single review
  getOne: (id: string): Promise<DeviceReview> => api(`/reviews/${id}`),

  // Admin/Staff: approve or reject
  moderate: (
    id: string,
    data: {
      status: ReviewStatus.APPROVED | ReviewStatus.REJECTED;
      adminNote?: string;
    },
  ) => fetchAPI(`/reviews/${id}/moderate`, { method: "PATCH", data }),

  // Admin: delete any review
  remove: (id: string) => fetchAPI(`/reviews/${id}`, { method: "DELETE" }),
};

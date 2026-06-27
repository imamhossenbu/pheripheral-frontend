/* eslint-disable @typescript-eslint/no-explicit-any */
import { serverFetchAPI } from "@/lib/api";

export interface BookingQueryDto {
  page?: number;
  limit?: number;
  deviceId?: string;
  userId?: string;
}

export interface BookingResponse {
  id: string;
  deviceId: string;
  variantId?: string;
  userId: string | null; // null হলে সিস্টেম ব্লক
  startDate: string;
  endDate: string;
  note?: string;
  createdAt: string;
  device: {
    id: string;
    name: string;
  };
  variant?: {
    id: string;
    name: string;
  };
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
}

export interface PaginatedBookingResponse {
  data: BookingResponse[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const bookingApiServer = {
  // এডমিন প্যানেলের জন্য গ্লোবাল বুকিং লিস্ট ফেচ
  findAll: (query: BookingQueryDto = {}) => {
    // 💡 FIX: টাইপ সেফটি বজায় রাখতে Record<string, string> টাইপ এসাইন করা হয়েছে
    const cleanQuery: Record<string, string> = {};

    // 💡 FIX: নাম্বার বা স্ট্রিং যাই আসুক না কেন, সঠিকভাবে চেক করে স্ট্রিং-এ কনভার্ট করার ফুলপ্রুফ লজিক
    if (query.page) cleanQuery.page = String(query.page);
    if (query.limit) cleanQuery.limit = String(query.limit);
    if (query.deviceId) cleanQuery.deviceId = query.deviceId;
    if (query.userId) cleanQuery.userId = query.userId;

    const params = new URLSearchParams(cleanQuery).toString();
    const path = params ? `/device-bookings?${params}` : "/device-bookings";

    return serverFetchAPI<PaginatedBookingResponse>(path, { method: "GET" });
  },
};

/* eslint-disable @typescript-eslint/no-explicit-any */
import { fetchAPI } from "@/lib/api";

export interface DeviceImage {
  id: string;
  deviceId: string;
  url: string;
  isPrimary: boolean;
  order: number;
  createdAt: string;
}

export interface Device {
  id: string;
  name: string;
  brand: string;
  model: string;
  serialNumber: string;
  price: string;
  status: "AVAILABLE" | "IN_MAINTENANCE" | "DEPLOYED" | "RETIRED" | string;
  description: string;
  specifications: Record<string, unknown>;
  workingPrinciple: string;
  purchaseDate: string;
  warrantyExpiry: string;
  category?: { id: string; name: string };
  images: DeviceImage[];
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: { name: string; email: string };
}

export interface ChatHistoryItem {
  role: "user" | "assistant";
  content: string;
}

export const deviceDetailsApi = {
  getDeviceById: (id: string) => {
    if (!id) throw new Error("Device ID register token is invalid.");
    return fetchAPI<Device>(`/devices/${id}`);
  },

  getDeviceReviews: (id: string) => {
    if (!id) return Promise.resolve({ data: [] });
    return fetchAPI<{ data: Review[] }>(`/reviews?deviceId=${id}`).catch(
      () => ({ data: [] }),
    );
  },

  // 🛠️ Axios এর নিয়ম অনুযায়ী body এর বদলে data অবজেক্ট পাস করা হয়েছে
  submitBorrowRequest: (
    deviceId: string,
    startDate: string,
    endDate: string,
    reason: string,
  ) => {
    if (!deviceId) throw new Error("Validation Guard: deviceId is required.");
    if (!reason) throw new Error("Validation Guard: reason is required.");

    return fetchAPI(`/borrow-requests`, {
      method: "POST",
      data: {
        deviceId: String(deviceId),
        startDate: String(startDate),
        endDate: String(endDate),
        reason: String(reason),
      },
    });
  },

  // 🤖 AI Chat Payload ফিক্সড (Axios data config)
  askAiAboutDevice: (
    deviceId: string,
    message: string,
    history: ChatHistoryItem[],
  ) => {
    if (!deviceId)
      throw new Error("Validation Guard: deviceId must be a valid string");
    if (!message) throw new Error("Validation Guard: message cannot be empty");

    return fetchAPI<{ reply: string; deviceId: string }>(`/devices/chat`, {
      method: "POST",
      data: {
        deviceId: String(deviceId),
        message: String(message),
        history: history || [],
      },
    });
  },
};

/* eslint-disable @typescript-eslint/no-explicit-any */
import { fetchAPI } from "@/lib/api";

export interface CategoryNode {
  id: string;
  name: string;
  parentId: string | null;
  subCategories?: CategoryNode[];
}

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
  status: "AVAILABLE" | "IN_MAINTENANCE" | "DEPLOYED" | "RETIRED";
  description: string;
  specifications: any;
  workingPrinciple: string;
  purchaseDate: string;
  warrantyExpiry: string;
  categoryId: string;
  category: { id: string; name: string };
  createdAt: string;
  images: DeviceImage[];
  qrCodeUrl?: string | null;
}

export interface InventoryLog {
  id: string;
  action: string;
  remarks: string | null;
  performedAt: string;
}

export interface DeviceFilterParams {
  page: number;
  limit?: number;
  search?: string;
  selectedCategoryId?: string;
  status?: string;
  minPrice?: string;
  maxPrice?: string;
}

export const catalogApi = {
  // ১. ক্যাটাগরি ট্রির ডাটা লোড
  getCategoriesTree: async (): Promise<CategoryNode[]> => {
    return fetchAPI<CategoryNode[]>("/categories?tree=true");
  },

  // ২. ফিল্টার ও পেজিনেশন সহ ডিভাইস ক্যাটালগ লোড
  getDevices: async (params: DeviceFilterParams) => {
    let query = `?page=${params.page}&limit=${params.limit || 9}`;
    if (params.search) query += `&search=${encodeURIComponent(params.search)}`;
    if (params.selectedCategoryId)
      query += `&categoryId=${params.selectedCategoryId}`;
    if (params.status) query += `&status=${params.status}`;
    if (params.minPrice) query += `&minPrice=${params.minPrice}`;
    if (params.maxPrice) query += `&maxPrice=${params.maxPrice}`;

    return fetchAPI<{ data: Device[]; meta: { totalPages: number } }>(
      `/devices${query}`,
    );
  },

  // ৩. নির্দিষ্ট ডিভাইসের অডিট লগ Ledger লোড
  getDeviceAuditLogs: async (deviceId: string): Promise<InventoryLog[]> => {
    const data = await fetchAPI<any>(
      `/inventory-logs?deviceId=${deviceId}&limit=100`,
    );
    return data.data || data || [];
  },
};

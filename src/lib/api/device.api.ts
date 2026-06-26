import { fetchAPI, api } from "@/lib/api"; 
// ─── TYPES ────────────────────────────────────────────────

export type DeviceStatus =
  | "AVAILABLE"
  | "IN_MAINTENANCE"
  | "DEPLOYED"
  | "RETIRED";

export interface DeviceImage {
  id: string;
  url: string;
  isPrimary: boolean;
  order: number;
}

export interface DeviceVariant {
  id: string;
  name: string;
  sku?: string;
  price?: number;
  stock: number;
  specifications?: Record<string, any>;
  imageUrl?: string;
  isActive: boolean;
}

export interface Category {
  id: string;
  name: string;
}

export interface Device {
  id: string;
  name: string;
  brand: string;
  model: string;
  serialNumber: string;
  price: number;
  status: DeviceStatus;
  description: string;
  specifications: Record<string, any>;
  workingPrinciple: string;
  purchaseDate: string;
  warrantyExpiry: string;
  categoryId: string;
  qrCodeUrl?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  category: Category;
  images: DeviceImage[];
  variants: DeviceVariant[];
}

export interface DeviceListResponse {
  data: Device[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface DeviceQuery {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  status?: DeviceStatus;
  minPrice?: number;
  maxPrice?: number;
}

export interface VariantPayload {
  id?: string; // existing variant update করতে
  name: string;
  sku?: string;
  price?: number;
  stock?: number;
  isActive?: boolean;
  specifications?: Record<string, any>;
}

export interface CreateDevicePayload {
  name: string;
  brand: string;
  model: string;
  serialNumber: string;
  price: number;
  status?: DeviceStatus;
  description: string;
  specifications: Record<string, any>;
  workingPrinciple: string;
  purchaseDate: string;
  warrantyExpiry: string;
  categoryId: string;
  file?: File; // primary image
  variants?: VariantPayload[];
}

export interface UpdateDevicePayload extends Partial<CreateDevicePayload> {
  deleteImageIds?: string[];
}

// ─── API FUNCTIONS ────────────────────────────────────────

export async function getDevices(
  query: DeviceQuery = {},
): Promise<DeviceListResponse> {
  const params = new URLSearchParams();
  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));
  if (query.search) params.set("search", query.search);
  if (query.categoryId) params.set("categoryId", query.categoryId);
  if (query.status) params.set("status", query.status);
  if (query.minPrice !== undefined)
    params.set("minPrice", String(query.minPrice));
  if (query.maxPrice !== undefined)
    params.set("maxPrice", String(query.maxPrice));

  return fetchAPI<DeviceListResponse>(`/devices?${params.toString()}`);
}

export async function getDevice(id: string): Promise<Device> {
  return fetchAPI<Device>(`/devices/${id}`);
}

export async function createDevice(
  payload: CreateDevicePayload,
): Promise<Device> {
  const form = new FormData();

  const { file, specifications, variants, ...rest } = payload;

  // Text fields
  Object.entries(rest).forEach(([key, val]) => {
    if (val !== undefined && val !== null) {
      form.append(key, String(val));
    }
  });

  // specifications → JSON string (multipart form এর জন্য)
  form.append("specifications", JSON.stringify(specifications));

  // variants → JSON string (multipart form এর জন্য)
  if (variants && variants.length > 0) {
    form.append("variants", JSON.stringify(variants));
  }

  // Image file
  if (file) form.append("file", file);

  const res = await api.post<Device>("/devices", form);
  return res.data;
}

export async function updateDevice(
  id: string,
  payload: UpdateDevicePayload,
): Promise<Device> {
  const form = new FormData();

  const { file, specifications, deleteImageIds, variants, ...rest } = payload;

  Object.entries(rest).forEach(([key, val]) => {
    if (val !== undefined && val !== null) {
      form.append(key, String(val));
    }
  });

  if (specifications) {
    form.append("specifications", JSON.stringify(specifications));
  }

  if (deleteImageIds && deleteImageIds.length > 0) {
    form.append("deleteImageIds", JSON.stringify(deleteImageIds));
  }

  if (variants && variants.length > 0) {
    form.append("variants", JSON.stringify(variants));
  }

  if (file) form.append("file", file);

  const res = await api.patch<Device>(`/devices/${id}`, form);
  return res.data;
}

export async function deleteDevice(
  id: string,
): Promise<{ message: string; id: string }> {
  return fetchAPI(`/devices/${id}`, { method: "DELETE" });
}

export async function getCategories(): Promise<Category[]> {
  // তোমার category endpoint অনুযায়ী adjust করো
  return fetchAPI<Category[]>("/categories");
}

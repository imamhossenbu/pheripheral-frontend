import { fetchAPI, serverFetchAPI } from '@/lib/api';

// ─── Enums ────────────────────────────────────────────────────────────────────

export type DeviceStatus = 'AVAILABLE' | 'IN_MAINTENANCE' | 'DEPLOYED' | 'RETIRED';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DeviceCategory {
  id: string;
  name: string;
}

export interface DeviceImage {
  id: string;
  url: string;
  isPrimary: boolean;
  order: number;
}

export interface Device {
  id: string;
  name: string;
  brand: string;
  model: string;
  serialNumber: string;
  price: number | string;
  status: DeviceStatus;
  description: string;
  specifications: Record<string, any>;
  purchaseDate: string;
  warrantyExpiry: string;
  categoryId: string;
  qrCodeUrl: string | null;
  imageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  category: DeviceCategory;
  images: DeviceImage[];
}

export interface DevicesResponse {
  data: Device[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface DeviceQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: DeviceStatus;
  categoryId?: string;
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
  purchaseDate: string;
  warrantyExpiry: string;
  categoryId: string;
}

export interface UpdateDevicePayload extends Partial<CreateDevicePayload> {}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildQuery(params: Record<string, any>): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== '');
  if (!entries.length) return '';
  return '?' + new URLSearchParams(entries as [string, string][]).toString();
}

// ─── Server-side ──────────────────────────────────────────────────────────────

export async function fetchDevices(params: DeviceQueryParams): Promise<DevicesResponse> {
  return serverFetchAPI<DevicesResponse>(`/devices${buildQuery(params)}`);
}

export async function fetchDevice(id: string): Promise<Device> {
  return serverFetchAPI<Device>(`/devices/${id}`);
}

// ─── Client-side ──────────────────────────────────────────────────────────────

export async function clientFetchDevice(id: string): Promise<Device> {
  return fetchAPI<Device>(`/devices/${id}`);
}

export async function createDevice(formData: FormData): Promise<Device> {
  return fetchAPI<Device>('/devices', {
    method: 'POST',
    data: formData,
    // axios removes Content-Type so multipart boundary is set automatically
  });
}

export async function updateDevice(id: string, formData: FormData): Promise<Device> {
  return fetchAPI<Device>(`/devices/${id}`, { method: 'PATCH', data: formData });
}

export async function deleteDevice(id: string): Promise<{ message: string }> {
  return fetchAPI(`/devices/${id}`, { method: 'DELETE' });
}

// ─── Display helpers ──────────────────────────────────────────────────────────

export function formatCurrency(v: number | string): string {
  return new Intl.NumberFormat('en-BD', {
    style: 'currency', currency: 'BDT', minimumFractionDigits: 2,
  }).format(Number(v));
}

export function formatDate(v: string | null): string {
  if (!v) return '—';
  return new Intl.DateTimeFormat('en-BD', { dateStyle: 'medium' }).format(new Date(v));
}

export const DEVICE_STATUS_LABEL: Record<DeviceStatus, string> = {
  AVAILABLE:      'Available',
  IN_MAINTENANCE: 'Maintenance',
  DEPLOYED:       'Deployed',
  RETIRED:        'Retired',
};

export const DEVICE_STATUS_BADGE: Record<DeviceStatus, string> = {
  AVAILABLE:      'badge badge-success',
  IN_MAINTENANCE: 'badge badge-warning',
  DEPLOYED:       'badge badge-info',
  RETIRED:        'badge badge-muted',
};
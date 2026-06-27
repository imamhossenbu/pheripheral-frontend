import { fetchAPI, serverFetchAPI } from "@/lib/api";

const isServer = typeof window === "undefined";

export interface InventoryLog {
  id: string;
  deviceId: string;
  action: string;
  remarks: string | null;
  performedAt: string;
  device: {
    id: string;
    name: string;
    serialNumber: string;
  };
}

export interface DeviceItem {
  id: string;
  name: string;
  serialNumber: string;
}

export interface LogsQuery {
  page?: number;
  limit?: number;
  deviceId?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
}

export interface LogsMeta {
  page: number;
  totalPages: number;
  total: number;
}

export const inventoryLogService = {
  getAll: (
    query: LogsQuery,
  ): Promise<{ data: InventoryLog[]; meta: LogsMeta }> => {
    const params = new URLSearchParams();
    params.set("page", String(query.page ?? 1));
    params.set("limit", String(query.limit ?? 12));
    if (query.deviceId) params.set("deviceId", query.deviceId);
    if (query.action) params.set("action", query.action);
    if (query.startDate)
      params.set("startDate", new Date(query.startDate).toISOString());
    if (query.endDate)
      params.set("endDate", new Date(query.endDate).toISOString());

    return isServer
      ? serverFetchAPI(`/inventory-logs?${params}`)
      : fetchAPI(`/inventory-logs?${params}`);
  },

  create: (data: { deviceId: string; action: string; remarks?: string }) => {
    return fetchAPI("/inventory-logs", {
      method: "POST",
      data,
    });
  },
};

export const deviceDropdownService = {
  getAll: (): Promise<{ data: DeviceItem[] }> => {
    return isServer
      ? serverFetchAPI("/devices?limit=200")
      : fetchAPI("/devices?limit=200");
  },
};

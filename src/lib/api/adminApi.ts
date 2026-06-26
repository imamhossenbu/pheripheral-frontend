// lib/api/adminApi.ts
import { cookies } from "next/headers";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export interface DashboardStats {
  counts: { users: number; devices: number; categories: number };
  usersByRole: { ADMIN: number; STAFF: number; STUDENT: number };
  devicesByStatus: {
    AVAILABLE: number;
    IN_MAINTENANCE: number;
    DEPLOYED: number;
    RETIRED: number;
  };
  totalInventoryValue: number;
  recentLogs: RecentLog[];
  recentUsers: RecentUser[];
  borrow: BorrowStats;
  ordersAndRevenue: OrderRevenueStats;
  fines: FineStats;
  lowStockVariants: LowStockVariant[];
  trends: { orders: TrendPoint[]; borrowRequests: TrendPoint[] };
}

export interface RecentLog {
  id: string;
  action: string;
  remarks: string | null;
  performedAt: string;
  device: { id: string; name: string; serialNumber: string };
}

export interface RecentUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  department: string | null;
  createdAt: string;
}

export interface BorrowStats {
  byStatus: {
    PENDING: number;
    APPROVED: number;
    REJECTED: number;
    RETURNED: number;
  };
  pendingCount: number;
  overdueCount: number;
  overdue: OverdueBorrow[];
}

export interface OverdueBorrow {
  id: string;
  device: { id: string; name: string; serialNumber: string };
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
  endDate: string;
  daysOverdue: number;
}

export interface OrderRevenueStats {
  totalOrders: number;
  byStatus: {
    PENDING: number;
    PROCESSING: number;
    COMPLETED: number;
    CANCELLED: number;
  };
  totalRevenue: number;
  monthlyRevenue: number;
}

export interface FineStats {
  unpaidTotal: number;
  unpaidCount: number;
  paidCount: number;
  waivedCount: number;
}

export interface LowStockVariant {
  variantId: string;
  variantName: string;
  stock: number;
  device: { id: string; name: string; serialNumber: string };
}

export interface TrendPoint {
  date: string;
  count: number;
}

// server-side fetch — cookie থেকে token নেয়
export async function getAdminDashboardStats(): Promise<DashboardStats> {
  const token = cookies().get("token")?.value;

  if (!token) throw new Error("Unauthorized");

  const res = await fetch(`${BASE_URL}/admin/dashboard`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || "Failed to fetch dashboard stats");
  }

  return res.json();
}

import { fetchAPI } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface StudentDashboardStats {
  borrowStats: {
    byStatus: {
      PENDING: number;
      APPROVED: number;
      REJECTED: number;
      RETURNED: number;
    };
    overdueCount: number;
  };
  orderStats: {
    byStatus: {
      PENDING: number;
      PROCESSING: number;
      COMPLETED: number;
      CANCELLED: number;
    };
    totalOrders: number;
    totalSpent: number;
  };
  fineStats: {
    unpaidTotal: number;
    unpaidCount: number;
    paidCount: number;
  };
  activeBorrows: {
    id: string;
    startDate: string;
    endDate: string;
    reason: string;
    status: string;
    device: {
      id: string;
      name: string;
      images: { url: string }[];
    };
    variant: { id: string; name: string } | null;
  }[];
  recentOrders: {
    id: string;
    orderNumber: string;
    status: string;
    paymentStatus: string;
    total: number;
    createdAt: string;
    invoice: { invoiceNumber: string; status: string } | null;
    items: { device: { name: string } }[];
  }[];
  pendingFines: {
    id: string;
    amount: number;
    reason: string;
    createdAt: string;
    borrowRequest: {
      device: { id: string; name: string };
    };
  }[];
}

// ─── API (client-side — axios interceptor token inject করে) ──────────────────

export const studentDashboardApi = {
  getStats: (): Promise<StudentDashboardStats> =>
    fetchAPI("/student/dashboard"),
};

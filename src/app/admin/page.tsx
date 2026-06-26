// app/admin/page.tsx
import { redirect } from "next/navigation";
import { getAdminDashboardStats } from "@/lib/api/adminApi";
import {
  KpiGrid,
  BorrowBreakdown,
  DeviceStatusBreakdown,
  RevenueCard,
  FinesCard,
  OverdueBorrowsTable,
  LowStockTable,
  ActivityLog,
  RecentUsersTable,
  TrendsCard,
  SectionHeader,
} from "@/components/admin/overview/AdminComponent";

export const metadata = { title: "Admin Dashboard — Periphex" };

export default async function AdminDashboardPage() {
  let data;
  try {
    data = await getAdminDashboardStats();
  } catch {
    redirect("/login");
  }

  return (
    <div className="dashboard-content space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-overline">Control Centre</span>
          <h1 className="text-heading-xl mt-1">Dashboard</h1>
          <p className="text-body-sm mt-1">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span className="status-dot status-dot-success animate-pulse" />
          <span className="text-caption">Live · refreshes every 60s</span>
        </div>
      </div>

      <KpiGrid data={data} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <TrendsCard data={data.trends} />
        <BorrowBreakdown data={data.borrow} />
        <DeviceStatusBreakdown data={data.devicesByStatus} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <RevenueCard data={data.ordersAndRevenue} />
        <FinesCard data={data.fines} />
        <div className="card-flat">
          <SectionHeader title="Users by Role" />
          <div className="space-y-2.5">
            {Object.entries(data.usersByRole).map(([role, count]) => (
              <div key={role} className="flex items-center gap-2">
                <span className="status-dot bg-[var(--color-brand-400)]" />
                <span className="text-body-sm flex-1 capitalize">{role.toLowerCase()}</span>
                <span className="font-semibold text-[var(--color-text-primary)] text-sm tabular-nums">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <SectionHeader
          title="Overdue Borrows"
          sub={
            data.borrow.overdueCount > 0
              ? `${data.borrow.overdueCount} borrow${data.borrow.overdueCount > 1 ? "s" : ""} past due`
              : "All borrows on schedule"
          }
        />
        <OverdueBorrowsTable rows={data.borrow.overdue} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <SectionHeader title="Low Stock Variants" sub="Variants at or below threshold (≤5)" />
          <LowStockTable rows={data.lowStockVariants} />
        </div>
        <div>
          <SectionHeader title="Recent Activity" sub="Last 10 inventory events" />
          <div className="card-flat">
            <ActivityLog logs={data.recentLogs} />
          </div>
        </div>
      </div>

      <div>
        <SectionHeader title="Recent Signups" sub="Latest 5 registered users" />
        <div className="card-flat">
          <RecentUsersTable users={data.recentUsers} />
        </div>
      </div>
    </div>
  );
}
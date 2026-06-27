// app/admin/orders/page.tsx
import { Suspense } from "react";
import { orderService } from "@/lib/api/OrderApi";
import OrderStats from "@/components/admin/orders/OrderStats";
import OrderFilters from "@/components/admin/orders/OrderFilters";
import OrderTable from "@/components/admin/orders/OrderTable";

export const metadata = { title: "Orders — Periphex Admin" };

interface PageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
    paymentStatus?: string;
  }>;
}

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const params = new URLSearchParams();
  if (sp.page) params.set("page", sp.page);
  if (sp.search) params.set("search", sp.search);
  if (sp.status) params.set("status", sp.status);
  if (sp.paymentStatus) params.set("paymentStatus", sp.paymentStatus);
  params.set("limit", "10");

  const { data: orders, meta } = await orderService.getAll(params.toString());
  const isFiltered = !!(sp.search || sp.status || sp.paymentStatus);

  return (
    <div className="dashboard-content space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-overline">Commerce</span>
          <h1 className="text-heading-xl mt-1">Orders</h1>
          <p className="text-body-sm mt-1">
            Manage customer orders, update statuses, and export records.
          </p>
        </div>
        {isFiltered && <span className="badge badge-brand mt-2">Filtered view</span>}
      </div>

      <Suspense fallback={<StatsSkeleton />}>
        <OrderStats orders={orders} total={meta.total} filtered={isFiltered} />
      </Suspense>

      <hr className="divider" />

      <OrderFilters />

      <Suspense fallback={<TableSkeleton />}>
        <OrderTable orders={orders} meta={meta} />
      </Suspense>
    </div>
  );
}

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="skeleton" style={{ height: 80, borderRadius: "var(--radius-md)" }} />
      ))}
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      <div className="skeleton" style={{ height: 44, borderRadius: "var(--radius-sm)" }} />
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="skeleton" style={{ height: 56, borderRadius: "var(--radius-sm)" }} />
      ))}
    </div>
  );
}
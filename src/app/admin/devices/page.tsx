import { Suspense } from "react";
import { getDevices, getCategories } from "@/lib/api/device.api";
import DeviceFilters from "@/components/admin/devices/DeviceFilters";
import DeviceTable from "@/components/admin/devices/Devicetable";
import { getCategoryTree } from "@/lib/api/category.api";


// ─── Types ────────────────────────────────────────────────

interface PageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    categoryId?: string;
    status?: string;
    minPrice?: string;
    maxPrice?: string;
  }>;
}

// ─── Page (Server Component) ──────────────────────────────

export default async function AdminDevicesPage({ searchParams }: PageProps) {
  const sp = await searchParams;

  const [devicesData, categories] = await Promise.all([
    getDevices({
      page: sp.page ? Number(sp.page) : 1,
      limit: 10,
      search: sp.search,
      categoryId: sp.categoryId,
      status: sp.status as any,
      minPrice: sp.minPrice ? Number(sp.minPrice) : undefined,
      maxPrice: sp.maxPrice ? Number(sp.maxPrice) : undefined,
    }),
    getCategoryTree(),
  ]);

  return (
    <div className="dashboard-content">
      {/* Page Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-overline mb-1">Inventory</p>
          <h1 className="text-heading-lg">Devices</h1>
          <p className="text-body-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
            Manage lab equipment, track status, and maintain inventory records.
          </p>
        </div>

        {/* Quick stats */}
        <div className="flex items-center gap-3" style={{ flexShrink: 0 }}>
          <StatChip
            label="Total"
            value={devicesData.meta.total}
            color="var(--color-text-primary)"
          />
          <StatChip
            label="Available"
            value={devicesData.data.filter((d) => d.status === "AVAILABLE").length}
            color="var(--color-success-500)"
          />
          <StatChip
            label="In Use"
            value={devicesData.data.filter((d) => d.status === "DEPLOYED").length}
            color="var(--color-info-500)"
          />
        </div>
      </div>

      <hr className="divider mb-5" />

      {/* Filters */}
      <div className="mb-5">
        <Suspense fallback={<div className="skeleton" style={{ height: 40, width: 500 }} />}>
          <DeviceFilters categories={categories} />
        </Suspense>
      </div>

      {/* Table */}
      <Suspense fallback={<TableSkeleton />}>
        <DeviceTable
          initialData={devicesData}
          categories={categories}
          searchParams={sp}
        />
      </Suspense>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────

function StatChip({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div
      className="stat-card"
      style={{ padding: "0.5rem 1rem", minWidth: 80, textAlign: "center" }}
    >
      <p className="stat-value" style={{ fontSize: "var(--font-size-xl)", color }}>
        {value}
      </p>
      <p className="stat-label">{label}</p>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <div className="skeleton" style={{ height: 40, borderRadius: "var(--radius-sm)" }} />
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="skeleton" style={{ height: 56, borderRadius: "var(--radius-sm)" }} />
      ))}
    </div>
  );
}
// app/admin/payments/page.tsx  — Server Component

import { Suspense } from "react";
import {
  fetchPayments,
  PaymentQueryParams,
  PaymentTransactionStatus,
  PaymentMethod,
} from "@/lib/api/payment-api";
import { PaymentStats } from "@/components/admin/payment/PaymentStats";
import { PaymentFilters } from "@/components/admin/payment/PaymentFilters";
import { PaymentsTable } from "@/components/admin/payment/PaymentsTable";
import { PaymentModal } from "@/components/admin/payment/PaymentModal";

interface PageProps {
  searchParams: {
    page?: string;
    limit?: string;
    status?: string;
    method?: string;
    orderId?: string;
    userId?: string;
    modal?: string; // payment id when modal is open
  };
}

function TableSkeleton() {
  return (
    <div className="space-y-3 p-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="skeleton h-12 rounded" />
      ))}
    </div>
  );
}

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="skeleton h-24 rounded" />
      ))}
    </div>
  );
}

export default async function PaymentsPage({ searchParams }: PageProps) {
  const params: PaymentQueryParams = {
    page: searchParams.page ? Math.max(1, parseInt(searchParams.page, 10)) : 1,
    limit: searchParams.limit
      ? Math.min(50, parseInt(searchParams.limit, 10))
      : 15,
    ...(searchParams.status && {
      status: searchParams.status as PaymentTransactionStatus,
    }),
    ...(searchParams.method && {
      method: searchParams.method as PaymentMethod,
    }),
    ...(searchParams.orderId && { orderId: searchParams.orderId }),
    ...(searchParams.userId && { userId: searchParams.userId }),
  };

  const { data: payments, meta } = await fetchPayments(params);

  return (
    <div className="dashboard-content">
      <div className="max-w-[1200px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <span className="text-overline mb-2 block">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand-500)] inline-block" />
              Finance
            </span>
            <h1 className="text-heading-xl">Payments</h1>
            <p className="text-body mt-1">
              Track all payment transactions across orders.
            </p>
          </div>
          <button className="btn btn-ghost btn-sm self-start mt-1" disabled>
            Export CSV
          </button>
        </div>

        {/* Stats */}
        <Suspense fallback={<StatsSkeleton />}>
          <PaymentStats payments={payments} total={meta.total} />
        </Suspense>

        {/* Table card */}
        <div className="card card-lg p-0 overflow-hidden">
          <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-[var(--color-surface-300)] flex-wrap">
            <div className="flex items-center gap-3">
              <h2 className="text-heading-sm">Transactions</h2>
              <span className="badge badge-muted">
                {meta.total.toLocaleString()}
              </span>
            </div>
            <PaymentFilters />
          </div>

          <Suspense fallback={<TableSkeleton />}>
            <PaymentsTable
              payments={payments}
              meta={meta}
              searchParams={searchParams as Record<string, string | undefined>}
            />
          </Suspense>
        </div>
      </div>

      {/* Payment detail modal — rendered when ?modal=<id> is in URL */}
      {searchParams.modal && <PaymentModal paymentId={searchParams.modal} />}
    </div>
  );
}

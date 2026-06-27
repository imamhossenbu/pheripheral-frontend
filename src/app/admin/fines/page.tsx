import { FilterHeader } from "@/components/admin/fine/FilterHeader";
import { FineTableRow } from "@/components/admin/fine/FineTableRow";
import { Pagination } from "@/components/admin/fine/Pagination";
import { fineApiServer } from "@/lib/api/fineApi";
import React from "react";


interface PageProps {
  searchParams: Promise<{
    page?: string;
    status?: "UNPAID" | "PAID" | "WAIVED";
  }>;
}

export default async function AdminFinesPage({ searchParams }: PageProps) {
  // Await searchParams according to Next.js 15+ standards
  const resolvedParams = await searchParams;
  const currentPage = resolvedParams.page
    ? parseInt(resolvedParams.page, 10)
    : 1;
  const statusFilter = resolvedParams.status;

  // Server-side fetching
  const response = await fineApiServer.findAll({
    page: currentPage,
    limit: 10,
    status: statusFilter,
  });

  return (
    <div className="min-h-screen bg-surface-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Fine Ledger Management
          </h1>
          <p className="text-sm text-text-secondary">
            View, track, process payments, and waive user penalties.
          </p>
        </div>

        {/* Filter Components */}
        <FilterHeader activeStatus={statusFilter} />

        {/* Data Table */}
        <div className="bg-surface-0 rounded-xl border border-surface-300 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-100 border-b border-surface-300 text-text-secondary text-xs uppercase tracking-wider font-semibold">
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Device</th>
                  <th className="px-6 py-4">Reason</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Issued Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-200 bg-surface-0">
                {response.data.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-12 text-center text-text-muted text-sm"
                    >
                      No fine reports found matching the criteria.
                    </td>
                  </tr>
                ) : (
                  response.data.map((fine) => (
                    <FineTableRow key={fine.id} fine={fine} />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <Pagination meta={response.meta} currentStatus={statusFilter} />
        </div>
      </div>
    </div>
  );
}

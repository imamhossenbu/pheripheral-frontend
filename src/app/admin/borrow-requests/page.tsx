/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { FilterHeader } from "@/components/borrow/FilterHeader";
import { BorrowTableRow } from "@/components/borrow/BorrowTableRow";
import { Pagination } from "@/components/borrow/Pagination";
import { borrowApiServer } from "@/lib/api/borrowApi";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    status?: string;
  }>;
}

export default async function AdminBorrowsPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const currentPage = resolvedParams.page
    ? parseInt(resolvedParams.page, 10)
    : 1;

  const statusFilter = resolvedParams.status
    ? (resolvedParams.status.toUpperCase() as any)
    : undefined;

  // NextJS Server API fetch block with full clean filter queries
  const response = await borrowApiServer.findAll({
    page: currentPage,
    limit: 10,
    status: statusFilter,
  });

  return (
    <div className="min-h-screen bg-surface-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Title Ledger */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Device Borrow Requests
          </h1>
          <p className="text-sm text-text-secondary">
            Approve or reject incoming equipment reservation logs.
          </p>
        </div>

        {/* Tab Selection Filter */}
        <FilterHeader activeStatus={statusFilter} />

        {/* Dynamic Table Container */}
        <div className="bg-surface-0 rounded-xl border border-surface-300 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-100 border-b border-surface-300 text-text-secondary text-xs uppercase tracking-wider font-semibold">
                  <th className="px-6 py-4">Requester</th>
                  <th className="px-6 py-4">Asset / Variant</th>
                  <th className="px-6 py-4">Purpose</th>
                  <th className="px-6 py-4">Duration Block</th>
                  <th className="px-6 py-4">State</th>
                  <th className="px-6 py-4 text-right">Review Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-200 bg-surface-0">
                {response.data.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-text-muted text-sm"
                    >
                      No active borrow records registered under this category.
                    </td>
                  </tr>
                ) : (
                  response.data.map((request) => (
                    <BorrowTableRow key={request.id} request={request} />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Control Pagination Component */}
          <Pagination meta={response.meta} currentStatus={statusFilter} />
        </div>
      </div>
    </div>
  );
}

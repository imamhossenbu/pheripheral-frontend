import React from "react";
import Link from "next/link";

interface PaginationProps {
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  currentStatus?: string;
}

export function Pagination({ meta, currentStatus }: PaginationProps) {
  const { page, totalPages, total } = meta;

  const buildUrl = (p: number) => {
    const params = new URLSearchParams();
    params.set("page", String(p));
    if (currentStatus) params.set("status", currentStatus);
    return `/admin/fines?${params.toString()}`;
  };

  return (
    <div className="px-6 py-4 flex items-center justify-between border-t border-surface-300 bg-surface-50">
      <div className="text-sm text-text-secondary">
        Showing total{" "}
        <span className="font-semibold text-text-primary">{total}</span> records
      </div>
      <div className="flex gap-2">
        <Link
          href={buildUrl(page - 1)}
          className={`px-3 py-1.5 text-xs font-medium rounded border border-surface-300 bg-surface-0 text-text-secondary hover:bg-surface-100 ${
            page <= 1 ? "pointer-events-none opacity-50" : ""
          }`}
        >
          Previous
        </Link>
        <div className="px-3 py-1.5 text-xs text-text-primary font-medium">
          Page {page} of {totalPages || 1}
        </div>
        <Link
          href={buildUrl(page + 1)}
          className={`px-3 py-1.5 text-xs font-medium rounded border border-surface-300 bg-surface-0 text-text-secondary hover:bg-surface-100 ${
            page >= totalPages ? "pointer-events-none opacity-50" : ""
          }`}
        >
          Next
        </Link>
      </div>
    </div>
  );
}

import React from "react";
import Link from "next/link";

interface PaginationProps {
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export function BookingPagination({ meta }: PaginationProps) {
  const { page, totalPages, total } = meta;

  const buildUrl = (p: number) => {
    const params = new URLSearchParams();
    params.set("page", String(p));
    return `/admin/device-bookings?${params.toString()}`;
  };

  return (
    <div className="px-6 py-4 flex items-center justify-between border-t border-surface-300 bg-surface-50">
      <div className="text-sm text-text-secondary">
        Total <span className="font-semibold text-text-primary">{total}</span>{" "}
        slot blocks registered
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

import React from "react";
import Link from "next/link";

export function FilterHeader({ activeStatus }: { activeStatus?: string }) {
  const statuses = [
    { label: "All Requests", value: undefined },
    { label: "Pending", value: "PENDING" },
    { label: "Approved", value: "APPROVED" },
    { label: "Rejected", value: "REJECTED" },
    { label: "Returned", value: "RETURNED" },
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-6 border-b border-surface-300 pb-4">
      {statuses.map((s) => {
        const isActive = activeStatus === s.value;
        const params = new URLSearchParams();
        if (s.value) params.set("status", s.value);
        params.set("page", "1");

        // 💡 FIX: লিংক পরিবর্তন করে /admin/borrow-requests করা হয়েছে
        return (
          <Link
            key={s.label}
            href={`/admin/borrow-requests?${params.toString()}`}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              isActive
                ? "bg-brand-500 text-surface-0 shadow-sm"
                : "bg-surface-50 text-text-secondary hover:bg-surface-200 border border-surface-300"
            }`}
          >
            {s.label}
          </Link>
        );
      })}
    </div>
  );
}

import React from "react";
import Link from "next/link";

export function FilterHeader({ activeStatus }: { activeStatus?: string }) {
  const statuses = [
    { label: "All Fines", value: undefined },
    { label: "Unpaid", value: "UNPAID" },
    { label: "Paid", value: "PAID" },
    { label: "Waived", value: "WAIVED" },
  ];

  return (
    <div className="flex gap-2 mb-6 border-b border-surface-300 pb-4">
      {statuses.map((s) => {
        const isActive = activeStatus === s.value;
        return (
          <Link
            key={s.label}
            href={s.value ? `/admin/fines?status=${s.value}` : "/admin/fines"}
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

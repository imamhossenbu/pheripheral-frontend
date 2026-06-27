"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import {
  PaymentTransactionStatus,
  PaymentMethod,
  METHOD_LABELS,
  STATUS_LABELS,
} from "@/lib/api/payment-api";

export function PaymentFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const activeStatus = searchParams.get("status") ?? "";
  const activeMethod = searchParams.get("method") ?? "";

  const navigate = (status: string, method: string) => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (method) params.set("method", method);
    startTransition(() => {
      router.push(`/admin/payments?${params.toString()}`);
    });
  };

  const statusOptions = [
    { value: "", label: "All statuses" },
    ...Object.entries(STATUS_LABELS).map(([v, l]) => ({ value: v, label: l })),
  ];

  const methodOptions = [
    { value: "", label: "All methods" },
    ...Object.entries(METHOD_LABELS).map(([v, l]) => ({ value: v, label: l })),
  ];

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        value={activeStatus}
        onChange={(e) => navigate(e.target.value, activeMethod)}
        disabled={isPending}
        className="input select text-sm py-2 min-w-[148px]"
      >
        {statusOptions.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      <select
        value={activeMethod}
        onChange={(e) => navigate(activeStatus, e.target.value)}
        disabled={isPending}
        className="input select text-sm py-2 min-w-[156px]"
      >
        {methodOptions.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      {(activeStatus || activeMethod) && (
        <div className="flex items-center gap-2">
          {activeStatus && (
            <span className="badge badge-brand">
              {STATUS_LABELS[activeStatus as PaymentTransactionStatus]}
            </span>
          )}
          {activeMethod && (
            <span className="badge badge-info">
              {METHOD_LABELS[activeMethod as PaymentMethod]}
            </span>
          )}
          <button
            onClick={() => navigate("", "")}
            disabled={isPending}
            className="btn btn-ghost btn-xs"
          >
            ✕ Clear
          </button>
        </div>
      )}
    </div>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { fineApiClient } from "@/lib/api/fineApi";

export function ActionButtons({
  fineId,
  status,
}: {
  fineId: string;
  status: string;
}) {
  const router = useRouter();

  if (status !== "UNPAID")
    return <span className="text-text-muted text-xs">—</span>;

  const handlePay = async () => {
    if (confirm("Are you sure you want to mark this fine as PAID?")) {
      try {
        await fineApiClient.pay(fineId);
        router.refresh();
      } catch (err: any) {
        alert(err.message || "Failed to process payment");
      }
    }
  };

  const handleWaive = async () => {
    const reason = prompt("Enter reason for waiving this fine:");
    if (!reason) return;

    try {
      await fineApiClient.waive(fineId, { waivedReason: reason });
      router.refresh();
    } catch (err: any) {
      alert(err.message || "Failed to waive fine");
    }
  };

  return (
    <div className="flex justify-end gap-2">
      <button
        onClick={handlePay}
        className="px-3 py-1 text-xs font-medium rounded bg-success-500 text-surface-0 hover:bg-success-400 transition"
      >
        Pay
      </button>
      <button
        onClick={handleWaive}
        className="px-3 py-1 text-xs font-medium rounded bg-warning-500 text-surface-0 hover:bg-warning-400 transition"
      >
        Waive
      </button>
    </div>
  );
}

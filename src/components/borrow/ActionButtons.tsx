/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";

import { useRouter } from "next/navigation";
import { borrowApiClient } from "@/lib/api/borrowApi";

export function ActionButtons({
  requestId,
  status,
}: {
  requestId: string;
  status: string;
}) {
  const router = useRouter();

  if (status !== "PENDING")
    return <span className="text-text-muted text-xs">—</span>;

  const handleReview = async (decision: "APPROVED" | "REJECTED") => {
    const note =
      prompt(`Enter optional admin note for ${decision.toLowerCase()}:`) ?? "";

    try {
      await borrowApiClient.review(requestId, {
        status: decision,
        adminNote: note,
      });
      router.refresh();
    } catch (err: any) {
      alert(err.message || "Failed to process review action");
    }
  };

  return (
    <div className="flex justify-end gap-2">
      <button
        onClick={() => handleReview("APPROVED")}
        className="px-3 py-1 text-xs font-medium rounded bg-success-500 text-surface-0 hover:bg-success-400 transition cursor-pointer"
      >
        Approve
      </button>
      <button
        onClick={() => handleReview("REJECTED")}
        className="px-3 py-1 text-xs font-medium rounded bg-danger-500 text-surface-0 hover:bg-danger-400 transition cursor-pointer"
      >
        Reject
      </button>
    </div>
  );
}

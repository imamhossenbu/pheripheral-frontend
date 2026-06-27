import React from "react";

export function BorrowStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: "bg-info-50 text-info-500 border-info-400/20",
    APPROVED: "bg-success-50 text-success-500 border-success-400/20",
    REJECTED: "bg-danger-50 text-danger-500 border-danger-400/20",
    RETURNED: "bg-surface-200 text-text-secondary border-surface-300",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${styles[status] || styles.PENDING}`}
    >
      {status}
    </span>
  );
}

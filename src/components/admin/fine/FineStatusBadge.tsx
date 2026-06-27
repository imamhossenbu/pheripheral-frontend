import React from "react";

export function FineStatusBadge({
  status,
}: {
  status: "UNPAID" | "PAID" | "WAIVED";
}) {
  const styles = {
    UNPAID: "bg-danger-50 text-danger-500 border-danger-400/20",
    PAID: "bg-success-50 text-success-500 border-success-400/20",
    WAIVED: "bg-warning-50 text-warning-500 border-warning-400/20",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${styles[status]}`}
    >
      {status}
    </span>
  );
}

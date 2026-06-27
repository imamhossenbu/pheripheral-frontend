import React from "react";

import { BorrowStatusBadge } from "./BorrowStatusBadge";
import { BorrowRequestResponse } from "@/lib/api/borrowApi";
import { ActionButtons } from "./ActionButtons";


export function BorrowTableRow({
  request,
}: {
  request: BorrowRequestResponse;
}) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-BD", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <tr className="border-b border-surface-300 hover:bg-surface-50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">
        {request.user
          ? `${request.user.firstName} ${request.user.lastName}`
          : "Unknown"}
        <div className="text-xs text-text-secondary">{request.user?.email}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
        <span className="text-text-primary font-medium">
          {request.device.name}
        </span>
        {request.variant && (
          <span className="block text-xs text-accent-500 font-mono bg-surface-100 px-1 py-0.5 rounded w-fit mt-0.5">
            {request.variant.name}
          </span>
        )}
      </td>
      <td
        className="px-6 py-4 text-sm text-text-secondary max-w-xs truncate"
        title={request.reason}
      >
        {request.reason}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-text-primary">
        {formatDate(request.startDate)}{" "}
        <span className="text-text-muted">➔</span> {formatDate(request.endDate)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        <BorrowStatusBadge status={request.status} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <ActionButtons requestId={request.id} status={request.status} />
      </td>
    </tr>
  );
}

import React from "react";
import { FineStatusBadge } from "./FineStatusBadge";
import { FineResponse } from "@/lib/api/fineApi";
import { ActionButtons } from "./ActionButtons";

export function FineTableRow({ fine }: { fine: FineResponse }) {
  return (
    <tr className="border-b border-surface-300 hover:bg-surface-50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">
        {fine.user.firstName} {fine.user.lastName}
        <div className="text-xs text-text-secondary">{fine.user.email}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
        {fine.borrowRequest.device.name}
      </td>
      <td
        className="px-6 py-4 text-sm text-text-secondary max-w-xs truncate"
        title={fine.reason}
      >
        {fine.reason}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-text-primary">
        ৳{Number(fine.amount).toFixed(2)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        <FineStatusBadge status={fine.status} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
        {new Date(fine.createdAt).toLocaleDateString("en-BD", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        {/* Actions trigger Client Interaction */}
        <ActionButtons fineId={fine.id} status={fine.status} />
      </td>
    </tr>
  );
}

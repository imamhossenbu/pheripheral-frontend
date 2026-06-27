import React from "react";
import { BookingResponse } from "@/lib/api/bookingApi";
import { calculateTimeRemaining } from "@/lib/date-utils";

export function BookingTableRow({ booking }: { booking: BookingResponse }) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-BD", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // লাইভ টাইম ক্যালকুলেশন
  const { isOverdue, statusText } = calculateTimeRemaining(
    booking.endDate,
    null,
  );
  const isSystemBlock = !booking.userId;

  return (
    <tr className="border-b border-surface-300 hover:bg-surface-50 transition-colors">
      {/* ১. কার জন্য বুকড বা মেইনটেইন্যান্স */}
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">
        {isSystemBlock ? (
          <span className="text-danger-500 font-semibold tracking-wide uppercase text-xs bg-danger-50 px-2 py-1 rounded">
            🛠️ System Maintenance
          </span>
        ) : (
          <>
            {booking.user?.firstName} {booking.user?.lastName}
            <div className="text-xs text-text-secondary">
              {booking.user?.email}
            </div>
          </>
        )}
      </td>

      {/* ২. ডিভাইসের নাম ও ভ্যারিয়েন্ট */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
        <span className="text-text-primary font-medium">
          {booking.device.name}
        </span>
        {booking.variant && (
          <span className="block text-xs text-accent-500 font-mono bg-surface-100 px-1 py-0.5 rounded w-fit mt-0.5">
            {booking.variant.name}
          </span>
        )}
      </td>

      {/* ৩. বুকিং শিডিউল টাইমলাইন */}
      <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-text-primary">
        {formatDate(booking.startDate)}{" "}
        <span className="text-text-muted">➔</span> {formatDate(booking.endDate)}
      </td>

      {/* ৪. লাইভ বাকি সময় বা ওভারডিউ ট্র্যাকিং */}
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${
            isOverdue
              ? "bg-danger-50 text-danger-600 border-danger-200"
              : "bg-success-50 text-success-600 border-success-200"
          }`}
        >
          {statusText}
        </span>
      </td>

      {/* ৫. এডমিন নোট বা রেফারেন্স */}
      <td
        className="px-6 py-4 text-sm text-text-secondary max-w-xs truncate"
        title={booking.note || ""}
      >
        {booking.note || (
          <span className="text-text-muted italic">No logs</span>
        )}
      </td>
    </tr>
  );
}

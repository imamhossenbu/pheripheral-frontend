import React from "react";
import { bookingApiServer } from "@/lib/api/bookingApi";
import { BookingTableRow } from "@/components/admin/booking/BookingTableRow";
import { BookingPagination } from "@/components/admin/booking/BookingPagination";


interface PageProps {
  searchParams: Promise<{
    page?: string;
  }>;
}

export default async function AdminDeviceBookingsPage({
  searchParams,
}: PageProps) {
  const resolvedParams = await searchParams;
  const currentPage = resolvedParams.page
    ? parseInt(resolvedParams.page, 10)
    : 1;

  // ব্যাকএন্ডের /device-bookings এন্ড পয়েন্ট থেকে ডেটা লোড
  const response = await bookingApiServer.findAll({
    page: currentPage,
    limit: 10,
  });

  return (
    <div className="min-h-screen bg-surface-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Page Title & Context */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Device Booking Ledger & Calendar
          </h1>
          <p className="text-sm text-text-secondary">
            Live master calendar tracking of all locked time slots, approved
            reserves, and active system maintenance blocks.
          </p>
        </div>

        {/* Spreadsheet Grid Panel */}
        <div className="bg-surface-0 rounded-xl border border-surface-300 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-100 border-b border-surface-300 text-text-secondary text-xs uppercase tracking-wider font-semibold">
                  <th className="px-6 py-4">Allocation Target</th>
                  <th className="px-6 py-4">Asset / Device Info</th>
                  <th className="px-6 py-4">Booking Time Slot</th>
                  <th className="px-6 py-4">Live Tracking</th>
                  <th className="px-6 py-4">System / Reference Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-200 bg-surface-0">
                {response.data.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-text-muted text-sm"
                    >
                      No active bookings or system lock-slots found in the
                      ledger database.
                    </td>
                  </tr>
                ) : (
                  response.data.map((booking) => (
                    <BookingTableRow key={booking.id} booking={booking} />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer Controls */}
          <BookingPagination meta={response.meta} />
        </div>
      </div>
    </div>
  );
}

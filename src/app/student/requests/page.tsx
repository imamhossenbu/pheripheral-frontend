"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CalendarDays,
  Timer,
  BookOpen,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  borrowApiClient,
  type BorrowRequestResponse,
  type PaginatedBorrowResponse,
} from "@/lib/api/borrowApi";

// ─── Types & Helpers ──────────────────────────────────────────────────────────

type BorrowStatus = "PENDING" | "APPROVED" | "REJECTED" | "RETURNED";

const STATUS_META: Record<
  BorrowStatus,
  { label: string; color: string; icon: React.ReactNode }
> = {
  PENDING: {
    label: "Pending",
    color: "text-amber-600 bg-amber-50 border-amber-200",
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  APPROVED: {
    label: "Approved",
    color: "text-emerald-600 bg-emerald-50 border-emerald-200",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  REJECTED: {
    label: "Rejected",
    color: "text-red-600 bg-red-50 border-red-200",
    icon: <XCircle className="w-3.5 h-3.5" />,
  },
  RETURNED: {
    label: "Returned",
    color: "text-gray-600 bg-gray-50 border-gray-200",
    icon: <RotateCcw className="w-3.5 h-3.5" />,
  },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ─── Countdown Hook ───────────────────────────────────────────────────────────

function useCountdown(endDate: string) {
  const calc = useCallback(() => {
    const diff = new Date(endDate).getTime() - Date.now();
    if (diff <= 0) return null;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return { days, hours, minutes, seconds, diff };
  }, [endDate]);

  const [remaining, setRemaining] = useState(calc);

  useEffect(() => {
    const id = setInterval(() => setRemaining(calc()), 1000);
    return () => clearInterval(id);
  }, [calc]);

  return remaining;
}

// ─── Countdown Display ────────────────────────────────────────────────────────

function CountdownBadge({ endDate }: { endDate: string }) {
  const r = useCountdown(endDate);

  if (!r) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-black">
        <AlertTriangle className="w-3.5 h-3.5" />
        Overdue — please return immediately
      </div>
    );
  }

  const isUrgent = r.diff < 1000 * 60 * 60 * 24; // less than 1 day
  const colorClass = isUrgent
    ? "bg-red-50 border-red-200 text-red-600"
    : r.days < 3
      ? "bg-amber-50 border-amber-200 text-amber-600"
      : "bg-brand-50 border-brand-200 text-brand-600";

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-black ${colorClass}`}
    >
      <Timer className="w-3.5 h-3.5 shrink-0" />
      <span>Return in:</span>
      <div className="flex items-center gap-1 font-mono">
        {r.days > 0 && (
          <span>
            {r.days}
            <span className="font-normal opacity-60">d</span>
          </span>
        )}
        <span>
          {String(r.hours).padStart(2, "0")}
          <span className="font-normal opacity-60">h</span>
        </span>
        <span>
          {String(r.minutes).padStart(2, "0")}
          <span className="font-normal opacity-60">m</span>
        </span>
        <span>
          {String(r.seconds).padStart(2, "0")}
          <span className="font-normal opacity-60">s</span>
        </span>
      </div>
    </div>
  );
}

// ─── Status Filter Tabs ───────────────────────────────────────────────────────

const FILTER_TABS = [
  { value: undefined, label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "RETURNED", label: "Returned" },
] as const;

// ─── Borrow Card ──────────────────────────────────────────────────────────────

function BorrowCard({
  request,
  onReturn,
}: {
  request: BorrowRequestResponse;
  onReturn: (id: string) => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [returning, setReturning] = useState(false);

  const meta = STATUS_META[request.status];
  const isApproved = request.status === "APPROVED";
  const isOverdue = isApproved && new Date(request.endDate) < new Date();

  const handleReturn = async () => {
    setReturning(true);
    try {
      await onReturn(request.id);
    } finally {
      setReturning(false);
    }
  };

  return (
    <motion.div
      layout
      className={`bg-surface-0 rounded-2xl border overflow-hidden shadow-sm transition-colors ${
        isOverdue
          ? "border-red-300 hover:border-red-400"
          : "border-surface-200 hover:border-brand-300"
      }`}
    >
      {/* ── Main row ── */}
      <div className="flex items-center justify-between p-5 gap-3 flex-wrap">
        {/* Left: device info */}
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`p-2.5 rounded-xl shrink-0 ${isOverdue ? "bg-red-50" : "bg-brand-50"}`}
          >
            <Package
              className={`w-5 h-5 ${isOverdue ? "text-red-500" : "text-brand-500"}`}
            />
          </div>
          <div className="min-w-0">
            <h3 className="font-black text-text-primary text-sm truncate">
              {request.device.name}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              {request.variant && (
                <span className="text-[10px] text-text-muted bg-surface-100 px-1.5 py-0.5 rounded-md">
                  {request.variant.name}
                </span>
              )}
              <span className="text-[10px] text-text-muted">
                {request.device.category.name}
              </span>
            </div>
          </div>
        </div>

        {/* Right: status + actions */}
        <div className="flex items-center gap-2 flex-wrap ml-auto">
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${meta.color}`}
          >
            {meta.icon}
            {meta.label}
          </span>

          {isApproved && (
            <button
              onClick={handleReturn}
              disabled={returning}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-[10px] font-black uppercase rounded-lg transition-colors"
            >
              {returning ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RotateCcw className="w-3.5 h-3.5" />
              )}
              {returning ? "Returning…" : "Return"}
            </button>
          )}

          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1 text-[10px] font-black uppercase text-brand-500 hover:text-brand-600 transition-colors p-1"
          >
            {expanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Countdown bar — approved only */}
      {isApproved && (
        <div className="px-5 pb-3">
          <CountdownBadge endDate={request.endDate} />
        </div>
      )}

      {/* ── Expanded details ── */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            key="details"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden border-t border-surface-200"
          >
            <div className="p-5 space-y-4">
              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-surface-50 rounded-xl p-3 border border-surface-200">
                  <div className="flex items-center gap-1.5 mb-1">
                    <CalendarDays className="w-3.5 h-3.5 text-text-muted" />
                    <span className="text-[9px] font-black uppercase text-text-muted">
                      Start Date
                    </span>
                  </div>
                  <p className="text-xs font-bold text-text-primary">
                    {formatDate(request.startDate)}
                  </p>
                </div>
                <div className="bg-surface-50 rounded-xl p-3 border border-surface-200">
                  <div className="flex items-center gap-1.5 mb-1">
                    <CalendarDays className="w-3.5 h-3.5 text-text-muted" />
                    <span className="text-[9px] font-black uppercase text-text-muted">
                      End Date
                    </span>
                  </div>
                  <p
                    className={`text-xs font-bold ${isOverdue ? "text-red-500" : "text-text-primary"}`}
                  >
                    {formatDate(request.endDate)}
                    {isOverdue && " (Overdue)"}
                  </p>
                </div>
              </div>

              {/* Reason */}
              <div className="bg-surface-50 rounded-xl p-3 border border-surface-200">
                <div className="flex items-center gap-1.5 mb-1">
                  <BookOpen className="w-3.5 h-3.5 text-text-muted" />
                  <span className="text-[9px] font-black uppercase text-text-muted">
                    Reason
                  </span>
                </div>
                <p className="text-xs text-text-primary leading-relaxed">
                  {request.reason}
                </p>
              </div>

              {/* Admin note */}
              {request.adminNote && (
                <div
                  className={`rounded-xl p-3 border text-xs leading-relaxed ${
                    request.status === "REJECTED"
                      ? "bg-red-50 border-red-200 text-red-700"
                      : "bg-blue-50 border-blue-200 text-blue-700"
                  }`}
                >
                  <span className="font-black uppercase text-[9px] block mb-1">
                    Admin Note
                  </span>
                  {request.adminNote}
                </div>
              )}

              {/* Return info */}
              {request.returnedAt && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-700">
                  <span className="font-black uppercase text-[9px] block mb-1">
                    Returned At
                  </span>
                  {formatDate(request.returnedAt)}
                </div>
              )}

              {/* Request date */}
              <p className="text-[10px] text-text-muted">
                Requested on {formatDate(request.createdAt)}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function StudentBorrowRequestsPage() {
  const [data, setData] = useState<PaginatedBorrowResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<BorrowStatus | undefined>(
    undefined,
  );
  const [page, setPage] = useState(1);

  const load = useCallback(
    async (status: BorrowStatus | undefined, pg: number) => {
      setLoading(true);
      try {
        const res = await borrowApiClient.getMyRequests({
          status,
          page: pg,
          limit: 10,
        });
        setData(res);
      } catch {
        toast.error("Failed to load borrow requests");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    load(activeFilter, page);
  }, [load, activeFilter, page]);

  const handleFilterChange = (status: BorrowStatus | undefined) => {
    setActiveFilter(status);
    setPage(1);
  };

  const handleReturn = async (id: string) => {
    try {
      await borrowApiClient.returnDevice(id);
      toast.success("Device returned successfully");
      // Refresh current page
      load(activeFilter, page);
    } catch (err: any) {
      toast.error(err?.message ?? "Could not return device");
    }
  };

  const requests = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="p-6 md:p-8 bg-surface-50 min-h-screen">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-black text-text-primary uppercase tracking-tight">
            Borrow Requests
          </h1>
          <p className="text-xs text-text-muted mt-1">
            View your device borrow history and return approved devices.
          </p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 bg-surface-100 p-1 rounded-xl w-fit mb-6 flex-wrap">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.label}
              onClick={() =>
                handleFilterChange(tab.value as BorrowStatus | undefined)
              }
              className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase transition-colors ${
                activeFilter === tab.value
                  ? "bg-surface-0 text-brand-500 shadow-sm"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin w-7 h-7 text-brand-500" />
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-10 h-10 text-surface-300 mx-auto mb-3" />
            <p className="font-black text-text-muted uppercase text-sm">
              No requests found
            </p>
            <p className="text-xs text-text-muted mt-1">
              {activeFilter
                ? `No ${activeFilter.toLowerCase()} requests yet.`
                : "You haven't made any borrow requests yet."}
            </p>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-3">
              {requests.map((req) => (
                <BorrowCard
                  key={req.id}
                  request={req}
                  onReturn={handleReturn}
                />
              ))}
            </div>

            {/* Pagination */}
            {meta && meta.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-[10px] text-text-muted">
                  Showing {(meta.page - 1) * meta.limit + 1}–
                  {Math.min(meta.page * meta.limit, meta.total)} of {meta.total}
                </p>
                <div className="flex gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="px-3 py-1.5 text-xs font-black uppercase border border-surface-200 rounded-lg disabled:opacity-40 hover:bg-surface-100 transition-colors"
                  >
                    Prev
                  </button>
                  <button
                    disabled={page === meta.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-3 py-1.5 text-xs font-black uppercase border border-surface-200 rounded-lg disabled:opacity-40 hover:bg-surface-100 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

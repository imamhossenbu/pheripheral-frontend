"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Loader2,
  Package,
  RotateCcw,
  ShoppingBag,
  ShieldAlert,
  Clock,
  AlertTriangle,
  Timer,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  studentDashboardApi,
  type StudentDashboardStats,
} from "@/lib/api/studentApi";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtMoney(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(n);
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ─── Countdown hook ───────────────────────────────────────────────────────────

function useCountdown(endDate: string) {
  const calc = useCallback(() => {
    const diff = new Date(endDate).getTime() - Date.now();
    if (diff <= 0) return null;
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
      diff,
    };
  }, [endDate]);

  const [r, setR] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setR(calc()), 1000);
    return () => clearInterval(id);
  }, [calc]);
  return r;
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  icon,
  accent,
  alert,
  href,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  accent: string;
  alert?: boolean;
  href?: string;
}) {
  const inner = (
    <div
      className={`bg-surface-0 rounded-2xl border p-5 flex flex-col gap-3 h-full transition-colors ${
        alert
          ? "border-red-300"
          : href
            ? "border-surface-200 hover:border-brand-300 cursor-pointer"
            : "border-surface-200"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black uppercase text-text-muted tracking-wider">
          {label}
        </span>
        <div className={`p-2 rounded-xl ${accent}`}>{icon}</div>
      </div>
      <div>
        <p className="text-2xl font-black text-text-primary leading-none">
          {value}
        </p>
        {sub && <p className="text-[10px] text-text-muted mt-1">{sub}</p>}
      </div>
    </div>
  );

  return href ? <Link href={href}>{inner}</Link> : <div>{inner}</div>;
}

// ─── Active Borrow Card with countdown ───────────────────────────────────────

function ActiveBorrowCard({
  borrow,
}: {
  borrow: StudentDashboardStats["activeBorrows"][number];
}) {
  const r = useCountdown(borrow.endDate);
  const isOverdue = !r;
  const isUrgent = r && r.diff < 86400000; // < 1 day

  const timerColor = isOverdue
    ? "bg-red-50 border-red-200 text-red-600"
    : isUrgent
      ? "bg-amber-50 border-amber-200 text-amber-600"
      : "bg-brand-50 border-brand-200 text-brand-600";

  return (
    <div
      className={`bg-surface-0 rounded-2xl border p-4 flex flex-col gap-3 ${isOverdue ? "border-red-300" : "border-surface-200"}`}
    >
      {/* Device */}
      <div className="flex items-center gap-3">
        {borrow.device.images[0] ? (
          <img
            src={borrow.device.images[0].url}
            alt={borrow.device.name}
            className="w-10 h-10 rounded-xl object-cover shrink-0 bg-surface-100"
          />
        ) : (
          <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
            <Package className="w-5 h-5 text-brand-400" />
          </div>
        )}
        <div className="min-w-0">
          <p className="text-sm font-black text-text-primary truncate">
            {borrow.device.name}
          </p>
          {borrow.variant && (
            <p className="text-[10px] text-text-muted">{borrow.variant.name}</p>
          )}
        </div>
      </div>

      {/* Dates */}
      <div className="flex gap-2 text-[10px] text-text-muted">
        <span>
          Due:{" "}
          <span
            className={`font-bold ${isOverdue ? "text-red-500" : "text-text-primary"}`}
          >
            {fmtDate(borrow.endDate)}
          </span>
        </span>
      </div>

      {/* Countdown */}
      <div
        className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-black ${timerColor}`}
      >
        {isOverdue ? (
          <>
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            Overdue — return immediately
          </>
        ) : (
          <>
            <Timer className="w-3.5 h-3.5 shrink-0" />
            <span className="opacity-70 font-normal">Return in</span>
            <span className="font-mono">
              {r!.days > 0 && `${r!.days}d `}
              {String(r!.hours).padStart(2, "0")}h{" "}
              {String(r!.minutes).padStart(2, "0")}m{" "}
              {String(r!.seconds).padStart(2, "0")}s
            </span>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Order Status Badge ───────────────────────────────────────────────────────

const ORDER_STATUS_COLOR: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-600 border-amber-200",
  PROCESSING: "bg-blue-50 text-blue-600 border-blue-200",
  COMPLETED: "bg-emerald-50 text-emerald-600 border-emerald-200",
  CANCELLED: "bg-red-50 text-red-600 border-red-200",
};

const PAYMENT_STATUS_COLOR: Record<string, string> = {
  UNPAID: "bg-red-50 text-red-600 border-red-200",
  PARTIAL: "bg-amber-50 text-amber-600 border-amber-200",
  PAID: "bg-emerald-50 text-emerald-600 border-emerald-200",
  REFUNDED: "bg-purple-50 text-purple-600 border-purple-200",
};

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span
      className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${color}`}
    >
      {label}
    </span>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function StudentDashboardPage() {
  const [stats, setStats] = useState<StudentDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentDashboardApi
      .getStats()
      .then(setStats)
      .catch(() => toast.error("Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface-50">
        <Loader2 className="animate-spin w-7 h-7 text-brand-500" />
      </div>
    );
  }

  if (!stats) return null;

  const {
    borrowStats,
    orderStats,
    fineStats,
    activeBorrows,
    recentOrders,
    pendingFines,
  } = stats;
  const totalBorrows = Object.values(borrowStats.byStatus).reduce(
    (a, b) => a + b,
    0,
  );

  return (
    <div className="p-6 md:p-8 bg-surface-50 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* ── Header ── */}
        <div>
          <h1 className="text-2xl font-black text-text-primary uppercase tracking-tight">
            My Dashboard
          </h1>
          <p className="text-xs text-text-muted mt-1">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        {/* ── Fine alert ── */}
        {pendingFines.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-red-700">
                You have {pendingFines.length} unpaid fine
                {pendingFines.length > 1 ? "s" : ""} —{" "}
                {fmtMoney(fineStats.unpaidTotal)} total
              </p>
              <div className="mt-2 space-y-1">
                {pendingFines.map((f) => (
                  <div
                    key={f.id}
                    className="flex justify-between text-xs text-red-600"
                  >
                    <span>
                      {f.borrowRequest.device.name} — {f.reason}
                    </span>
                    <span className="font-black">{fmtMoney(f.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Quick stats ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Total Borrows"
            value={totalBorrows}
            sub={`${borrowStats.byStatus.APPROVED} active`}
            icon={<BookOpen className="w-4 h-4 text-brand-600" />}
            accent="bg-brand-50"
            href="/dashboard/borrow-requests"
          />
          <StatCard
            label="Active Now"
            value={activeBorrows.length}
            sub={
              borrowStats.overdueCount > 0
                ? `${borrowStats.overdueCount} overdue`
                : "All on time"
            }
            icon={<Clock className="w-4 h-4 text-emerald-600" />}
            accent="bg-emerald-50"
            alert={borrowStats.overdueCount > 0}
          />
          <StatCard
            label="My Orders"
            value={orderStats.totalOrders}
            sub={`${fmtMoney(orderStats.totalSpent)} spent`}
            icon={<ShoppingBag className="w-4 h-4 text-blue-600" />}
            accent="bg-blue-50"
            href="/dashboard/orders"
          />
          <StatCard
            label="Unpaid Fines"
            value={fmtMoney(fineStats.unpaidTotal)}
            sub={
              fineStats.unpaidCount > 0
                ? `${fineStats.unpaidCount} pending`
                : "All clear"
            }
            icon={<ShieldAlert className="w-4 h-4 text-red-600" />}
            accent="bg-red-50"
            alert={fineStats.unpaidCount > 0}
          />
        </div>

        {/* ── Active borrows ── */}
        {activeBorrows.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4 text-brand-500" />
                <h2 className="text-xs font-black uppercase text-text-primary tracking-wider">
                  Active Borrows
                </h2>
              </div>
              <Link
                href="/dashboard/borrow-requests"
                className="text-[10px] font-black uppercase text-brand-500 hover:text-brand-600 flex items-center gap-1"
              >
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {activeBorrows.map((b) => (
                <ActiveBorrowCard key={b.id} borrow={b} />
              ))}
            </div>
          </div>
        )}

        {/* ── Borrow breakdown + recent orders ── */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Borrow status breakdown */}
          <div className="bg-surface-0 border border-surface-200 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <RotateCcw className="w-4 h-4 text-brand-500" />
              <h2 className="text-xs font-black uppercase text-text-primary tracking-wider">
                Borrow Overview
              </h2>
            </div>
            <div className="space-y-3">
              {[
                {
                  label: "Pending Approval",
                  value: borrowStats.byStatus.PENDING,
                  color: "bg-amber-400",
                  textColor: "text-amber-600",
                },
                {
                  label: "Approved / Active",
                  value: borrowStats.byStatus.APPROVED,
                  color: "bg-emerald-400",
                  textColor: "text-emerald-600",
                },
                {
                  label: "Returned",
                  value: borrowStats.byStatus.RETURNED,
                  color: "bg-gray-300",
                  textColor: "text-text-muted",
                },
                {
                  label: "Rejected",
                  value: borrowStats.byStatus.REJECTED,
                  color: "bg-red-300",
                  textColor: "text-red-500",
                },
              ].map(({ label, value, color, textColor }) => (
                <div key={label} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-text-muted">{label}</span>
                    <span className={`font-black ${textColor}`}>{value}</span>
                  </div>
                  <div className="h-1.5 bg-surface-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${color}`}
                      style={{
                        width:
                          totalBorrows > 0
                            ? `${(value / totalBorrows) * 100}%`
                            : "0%",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            {borrowStats.overdueCount > 0 && (
              <div className="mt-4 flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                {borrowStats.overdueCount} overdue — please return immediately
              </div>
            )}
          </div>

          {/* Recent orders */}
          <div className="bg-surface-0 border border-surface-200 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-brand-500" />
                <h2 className="text-xs font-black uppercase text-text-primary tracking-wider">
                  Recent Orders
                </h2>
              </div>
              <Link
                href="/dashboard/orders"
                className="text-[10px] font-black uppercase text-brand-500 hover:text-brand-600 flex items-center gap-1"
              >
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <p className="text-xs text-text-muted text-center py-6">
                No orders yet.
              </p>
            ) : (
              <div className="space-y-2">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between py-2 border-b border-surface-100 last:border-0 gap-2"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-text-primary truncate">
                        {order.items[0]?.device.name ?? "Order"}
                        {order.items.length > 1 &&
                          ` +${order.items.length - 1} more`}
                      </p>
                      <p className="text-[10px] text-text-muted">
                        {order.orderNumber}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <Badge
                        label={order.status}
                        color={
                          ORDER_STATUS_COLOR[order.status] ??
                          "bg-surface-100 text-text-muted border-surface-200"
                        }
                      />
                      <Badge
                        label={order.paymentStatus}
                        color={
                          PAYMENT_STATUS_COLOR[order.paymentStatus] ??
                          "bg-surface-100 text-text-muted border-surface-200"
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Order stat summary */}
            <div className="mt-4 pt-3 border-t border-surface-200 grid grid-cols-2 gap-2">
              <div className="text-center">
                <p className="text-[9px] uppercase font-black text-text-muted">
                  Total Spent
                </p>
                <p className="text-sm font-black text-text-primary">
                  {fmtMoney(orderStats.totalSpent)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-[9px] uppercase font-black text-text-muted">
                  Completed
                </p>
                <p className="text-sm font-black text-emerald-600">
                  {orderStats.byStatus.COMPLETED}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

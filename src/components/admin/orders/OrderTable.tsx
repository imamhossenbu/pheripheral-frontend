// components/admin/orders/OrderTable.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Download, X, Package } from "lucide-react";
import type { Order, OrderStatus } from "@/lib/api/OrderApi";
import { orderService } from "@/lib/api/OrderApi";
import toast from "react-hot-toast";

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function fmtCurrency(n: number | string) {
    return `৳${Number(n).toLocaleString("en-US")}`;
}

function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", {
        day: "numeric", month: "short", year: "numeric",
    });
}

function fmtDateTime(iso: string) {
    return new Date(iso).toLocaleString("en-US", {
        day: "numeric", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    });
}

// ─── BADGES ───────────────────────────────────────────────────────────────────

const ORDER_STATUS_STYLE: Record<string, string> = {
    PENDING: "badge-warning", PROCESSING: "badge-info",
    COMPLETED: "badge-success", CANCELLED: "badge-danger",
};

const PAYMENT_STATUS_STYLE: Record<string, string> = {
    UNPAID: "badge-danger", PARTIAL: "badge-warning",
    PAID: "badge-success", REFUNDED: "badge-muted",
};

function OrderStatusBadge({ status }: { status: string }) {
    return <span className={`badge ${ORDER_STATUS_STYLE[status] ?? "badge-muted"}`}>{status}</span>;
}

function PaymentStatusBadge({ status }: { status: string }) {
    return <span className={`badge ${PAYMENT_STATUS_STYLE[status] ?? "badge-muted"}`}>{status}</span>;
}

// ─── DETAIL MODAL ─────────────────────────────────────────────────────────────

function OrderDetailModal({ order, onClose, onDownload }: {
    order: Order; onClose: () => void; onDownload: () => void;
}) {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal"
                style={{ maxWidth: "42rem", width: "100%", maxHeight: "92dvh", overflowY: "auto" }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-start justify-between mb-5">
                    <div>
                        <span className="text-overline">Order Details</span>
                        <h2 className="text-heading-sm mt-0.5">#{order.orderNumber}</h2>
                        <p className="text-caption mt-0.5">{fmtDateTime(order.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={onDownload} className="btn btn-ghost btn-sm flex items-center gap-1.5">
                            <Download size={14} /> Invoice PDF
                        </button>
                        <button className="btn btn-icon" onClick={onClose}><X size={16} /></button>
                    </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-5">
                    <OrderStatusBadge status={order.status} />
                    <PaymentStatusBadge status={order.paymentStatus} />
                </div>

                {/* Customer */}
                <div className="rounded-[var(--radius-md)] p-4 mb-5"
                    style={{ background: "var(--color-surface-100)", border: "1px solid var(--color-surface-300)" }}>
                    <p className="text-label mb-2">Customer</p>
                    <p className="font-semibold text-[var(--color-text-primary)]">
                        {order.user.firstName} {order.user.lastName}
                    </p>
                    <p className="text-body-sm">{order.user.email}</p>
                    {order.user.department && <p className="text-caption mt-0.5">{order.user.department}</p>}
                </div>

                {/* Items */}
                <div className="mb-5">
                    <p className="text-label mb-3">Items ({order.items.length})</p>
                    <div className="space-y-2">
                        {order.items.map((item) => {
                            const img = item.device?.images?.find((i) => i.isPrimary)?.url
                                ?? item.device?.images?.[0]?.url ?? null;
                            return (
                                <div key={item.id} className="flex items-center gap-3 rounded-[var(--radius-sm)] p-3"
                                    style={{ border: "1px solid var(--color-surface-300)" }}>
                                    <div className="w-10 h-10 rounded flex-shrink-0 overflow-hidden"
                                        style={{ background: "var(--color-surface-200)" }}>
                                        {img
                                            ? <img src={img} alt="" className="w-full h-full object-cover" />
                                            : <div className="w-full h-full flex items-center justify-center">
                                                <Package size={14} className="text-[var(--color-text-muted)]" />
                                            </div>
                                        }
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                                            {item.device?.name ?? "—"}
                                        </p>
                                        {item.variant && <p className="text-caption">{item.variant.name}</p>}
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                                            {fmtCurrency(item.total)}
                                        </p>
                                        <p className="text-caption">{item.quantity} × {fmtCurrency(item.unitPrice)}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Price breakdown */}
                <div className="rounded-[var(--radius-md)] p-4 mb-5 space-y-2"
                    style={{ background: "var(--color-surface-50)", border: "1px solid var(--color-surface-300)" }}>
                    <div className="flex justify-between text-body-sm">
                        <span>Subtotal</span><span>{fmtCurrency(order.subtotal)}</span>
                    </div>
                    {Number(order.discount) > 0 && (
                        <div className="flex justify-between text-body-sm text-[var(--color-success-500)]">
                            <span>Discount</span><span>−{fmtCurrency(order.discount)}</span>
                        </div>
                    )}
                    {Number(order.tax) > 0 && (
                        <div className="flex justify-between text-body-sm">
                            <span>Tax</span><span>{fmtCurrency(order.tax)}</span>
                        </div>
                    )}
                    <div className="flex justify-between font-bold text-[var(--color-text-primary)] pt-2"
                        style={{ borderTop: "1px solid var(--color-surface-300)" }}>
                        <span>Total</span><span>{fmtCurrency(order.total)}</span>
                    </div>
                </div>

                {/* Payments */}
                {order.payments?.length > 0 && (
                    <div>
                        <p className="text-label mb-3">Payments</p>
                        <div className="space-y-2">
                            {order.payments.map((p) => (
                                <div key={p.id} className="flex items-center justify-between rounded-[var(--radius-sm)] px-4 py-2.5"
                                    style={{ border: "1px solid var(--color-surface-300)" }}>
                                    <div>
                                        <p className="text-sm font-medium text-[var(--color-text-primary)]">
                                            {p.method.replace(/_/g, " ")}
                                        </p>
                                        {p.transactionId && <p className="text-caption font-mono">{p.transactionId}</p>}
                                        {p.paidAt && <p className="text-caption">{fmtDate(p.paidAt)}</p>}
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-[var(--color-text-primary)]">{fmtCurrency(p.amount)}</p>
                                        <span className={`badge ${p.status === "SUCCESS" ? "badge-success" : p.status === "FAILED" ? "badge-danger" : "badge-warning"}`}>
                                            {p.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {order.notes && (
                    <div className="mt-4 p-3 rounded-[var(--radius-sm)] bg-[var(--color-surface-100)]">
                        <p className="text-label mb-1">Notes</p>
                        <p className="text-body-sm">{order.notes}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── PAGINATION ───────────────────────────────────────────────────────────────

function Pagination({ page, totalPages, total, limit }: {
    page: number; totalPages: number; total: number; limit: number;
}) {
    const router = useRouter();

    function goPage(p: number) {
        const params = new URLSearchParams(window.location.search);
        params.set("page", String(p));
        router.push(`/admin/orders?${params.toString()}`);
    }

    if (totalPages <= 1) return null;

    const pages: (number | "...")[] = [];
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) pages.push(i);
        else if (pages[pages.length - 1] !== "...") pages.push("...");
    }

    return (
        <div className="flex items-center justify-between mt-4">
            <p className="text-caption">
                Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total} orders
            </p>
            <div className="flex items-center gap-1">
                <button className="btn btn-ghost btn-xs" disabled={page <= 1} onClick={() => goPage(page - 1)}>
                    ← Prev
                </button>
                {pages.map((p, i) =>
                    p === "..." ? (
                        <span key={i} className="px-2 text-[var(--color-text-muted)] text-sm">…</span>
                    ) : (
                        <button key={p} className={`btn btn-xs ${p === page ? "btn-primary" : "btn-ghost"}`}
                            onClick={() => goPage(p as number)}>{p}</button>
                    )
                )}
                <button className="btn btn-ghost btn-xs" disabled={page >= totalPages} onClick={() => goPage(page + 1)}>
                    Next →
                </button>
            </div>
        </div>
    );
}

// ─── MAIN TABLE ───────────────────────────────────────────────────────────────

interface Props {
    orders: Order[];
    meta: { total: number; page: number; limit: number; totalPages: number };
}

export default function OrderTable({ orders, meta }: Props) {
    const router = useRouter();
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    async function handleStatusChange(id: string, status: OrderStatus) {
        setUpdatingId(id);
        try {
            await orderService.update(id, { status });
            toast.success("Order status updated");
            router.refresh();
        } catch (err: any) {
            toast.error(err.message || "Failed to update status");
        } finally {
            setUpdatingId(null);
        }
    }

    async function handleDownload(order: Order) {
        try {
            await orderService.downloadInvoice(order.id, order.orderNumber);
            toast.success("Invoice downloaded");
        } catch (err: any) {
            toast.error(err.message || "Failed to download invoice");
        }
    }

    if (orders.length === 0) {
        return (
            <div className="card-flat text-center py-16">
                <p className="text-heading-sm text-[var(--color-text-muted)]">No orders found</p>
                <p className="text-body-sm mt-1">Try adjusting your filters.</p>
            </div>
        );
    }

    return (
        <>
            <div className="table-wrap">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Order</th>
                            <th>Customer</th>
                            <th>Items</th>
                            <th>Total</th>
                            <th>Payment</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr key={order.id}>
                                <td>
                                    <span className="font-mono text-xs text-[var(--color-accent-600)] bg-[rgba(61,102,148,.07)] px-2 py-0.5 rounded border border-[rgba(61,102,148,.15)]">
                                        {order.orderNumber}
                                    </span>
                                </td>
                                <td>
                                    <p className="font-medium text-[var(--color-text-primary)] text-sm">
                                        {order.user.firstName} {order.user.lastName}
                                    </p>
                                    <p className="text-caption">{order.user.email}</p>
                                </td>
                                <td className="text-body-sm">
                                    {order.items?.length ?? 0} item{(order.items?.length ?? 0) !== 1 ? "s" : ""}
                                </td>
                                <td>
                                    <span className="font-semibold text-[var(--color-text-primary)] text-sm">
                                        {fmtCurrency(order.total)}
                                    </span>
                                </td>
                                <td><PaymentStatusBadge status={order.paymentStatus} /></td>
                                <td>
                                    <select
                                        className="input select text-sm"
                                        style={{ minWidth: 130, padding: "0.3rem 2rem 0.3rem 0.6rem" }}
                                        value={order.status}
                                        disabled={updatingId === order.id}
                                        onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                                    >
                                        <option value="PENDING">Pending</option>
                                        <option value="PROCESSING">Processing</option>
                                        <option value="COMPLETED">Completed</option>
                                        <option value="CANCELLED">Cancelled</option>
                                    </select>
                                </td>
                                <td className="text-body-sm">{fmtDate(order.createdAt)}</td>
                                <td>
                                    <div className="flex items-center gap-1">
                                        <button className="btn btn-icon btn-xs" title="View details"
                                            onClick={() => setSelectedOrder(order)}>
                                            <Eye size={14} />
                                        </button>
                                        <button className="btn btn-icon btn-xs" title="Download invoice"
                                            onClick={() => handleDownload(order)}>
                                            <Download size={14} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Pagination page={meta.page} totalPages={meta.totalPages} total={meta.total} limit={meta.limit} />

            {selectedOrder && (
                <OrderDetailModal
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                    onDownload={() => handleDownload(selectedOrder)}
                />
            )}
        </>
    );
}
// app/staff/orders/page.tsx — Server Component

import Link from 'next/link';
import {
    fetchOrders, OrderQueryParams, OrderStatus, PaymentStatus,
    ORDER_STATUS_LABEL, ORDER_STATUS_BADGE,
    PAYMENT_STATUS_LABEL, PAYMENT_STATUS_BADGE,
    formatCurrency, formatDate
} from '@/lib/staff/order-api';
import { OrderModal } from '@/components/staff/order/OrderModal';


interface PageProps {
    searchParams: {
        page?: string; limit?: string;
        status?: string; paymentStatus?: string; modal?: string;
    };
}

function StatusFilter({ searchParams }: { searchParams: PageProps['searchParams'] }) {
    const active = searchParams.status ?? '';
    const statuses: { value: string; label: string }[] = [
        { value: '', label: 'All' },
        { value: 'PENDING', label: 'Pending' },
        { value: 'PROCESSING', label: 'Processing' },
        { value: 'COMPLETED', label: 'Completed' },
        { value: 'CANCELLED', label: 'Cancelled' },
    ];
    return (
        <form method="GET" className="flex items-center gap-2 flex-wrap">
            {searchParams.paymentStatus && (
                <input type="hidden" name="paymentStatus" value={searchParams.paymentStatus} />
            )}
            {statuses.map((s) => (
                <button
                    key={s.value}
                    name="status"
                    value={s.value}
                    type="submit"
                    className={`btn btn-sm ${active === s.value ? 'btn-primary' : 'btn-ghost'}`}
                >
                    {s.label}
                </button>
            ))}
        </form>
    );
}

function OrderRow({ order, searchParams }: {
    order: Awaited<ReturnType<typeof fetchOrders>>['data'][number];
    searchParams: PageProps['searchParams'];
}) {
    const modalHref = `/staff/orders?${new URLSearchParams({
        ...(searchParams.status ? { status: searchParams.status } : {}),
        ...(searchParams.page ? { page: searchParams.page } : {}),
        modal: order.id,
    })}`;

    const name = [order.user.firstName, order.user.lastName].filter(Boolean).join(' ') || order.user.email;
    const initials = [order.user.firstName?.[0], order.user.lastName?.[0]].filter(Boolean).join('').toUpperCase()
        || order.user.email[0].toUpperCase();

    const isPending = order.status === 'PENDING';

    return (
        <tr className={isPending ? 'bg-[var(--color-warning-50)]' : ''}>
            <td>
                <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-[var(--color-text-primary)] text-sm">
                        {order.orderNumber}
                    </span>
                    <span className="text-caption">{formatDate(order.createdAt)}</span>
                </div>
            </td>
            <td>
                <div className="flex items-center gap-2.5">
                    <div className="avatar avatar-sm">{initials}</div>
                    <div className="min-w-0">
                        <div className="text-sm font-medium text-[var(--color-text-primary)] truncate max-w-[140px]">{name}</div>
                        {order.user.department && (
                            <div className="text-caption">{order.user.department}</div>
                        )}
                    </div>
                </div>
            </td>
            <td>
                <div className="flex flex-col gap-0.5">
                    <span className="text-sm text-[var(--color-text-secondary)]">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    </span>
                    <span className="text-caption truncate max-w-[140px]">
                        {order.items[0]?.device.name}{order.items.length > 1 ? ` +${order.items.length - 1}` : ''}
                    </span>
                </div>
            </td>
            <td>
                <span className="font-semibold text-[var(--color-text-primary)] tabular-nums">
                    {formatCurrency(order.total)}
                </span>
            </td>
            <td><span className={ORDER_STATUS_BADGE[order.status]}>{ORDER_STATUS_LABEL[order.status]}</span></td>
            <td><span className={PAYMENT_STATUS_BADGE[order.paymentStatus]}>{PAYMENT_STATUS_LABEL[order.paymentStatus]}</span></td>
            <td className="text-right">
                <Link href={modalHref} className={`btn btn-xs ${isPending ? 'btn-primary' : 'btn-ghost'}`}>
                    {isPending ? 'Review' : 'View'}
                </Link>
            </td>
        </tr>
    );
}

function Pagination({ meta, searchParams }: {
    meta: { total: number; page: number; limit: number; totalPages: number };
    searchParams: PageProps['searchParams'];
}) {
    if (meta.totalPages <= 1) return null;
    const href = (p: number) => {
        const params = new URLSearchParams({ ...(searchParams as any), page: String(p) });
        params.delete('modal');
        return `/staff/orders?${params}`;
    };
    return (
        <div className="flex items-center justify-between px-5 py-4 border-t border-[var(--color-surface-300)]">
            <p className="text-caption">{(meta.page - 1) * meta.limit + 1}–{Math.min(meta.page * meta.limit, meta.total)} of {meta.total}</p>
            <div className="flex gap-1">
                <Link href={href(meta.page - 1)} className={`btn btn-icon btn-xs ${meta.page === 1 ? 'pointer-events-none opacity-40' : ''}`}>‹</Link>
                {Array.from({ length: meta.totalPages }, (_, i) => i + 1).filter(p => p === 1 || p === meta.totalPages || Math.abs(p - meta.page) <= 2).map((p, i, arr) => (
                    <span key={p} className="flex items-center gap-1">
                        {arr[i - 1] && p - arr[i - 1] > 1 && <span className="text-caption px-1">…</span>}
                        <Link href={href(p)} className={`btn btn-xs ${p === meta.page ? 'btn-primary' : 'btn-ghost'}`}>{p}</Link>
                    </span>
                ))}
                <Link href={href(meta.page + 1)} className={`btn btn-icon btn-xs ${meta.page === meta.totalPages ? 'pointer-events-none opacity-40' : ''}`}>›</Link>
            </div>
        </div>
    );
}

export default async function StaffOrdersPage({ searchParams }: PageProps) {
    const params: OrderQueryParams = {
        page: searchParams.page ? parseInt(searchParams.page, 10) : 1,
        limit: 15,
        ...(searchParams.status && { status: searchParams.status as OrderStatus }),
        ...(searchParams.paymentStatus && { paymentStatus: searchParams.paymentStatus as PaymentStatus }),
    };

    const { data: orders, meta } = await fetchOrders(params);
    const pendingCount = orders.filter(o => o.status === 'PENDING').length;

    return (
        <div className="dashboard-content">
            <div className="max-w-[1200px] mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                        <span className="text-overline mb-2 block">
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand-500)] inline-block" />
                            Staff Panel
                        </span>
                        <h1 className="text-heading-xl">Orders</h1>
                        <p className="text-body mt-1">Review, process and track customer orders.</p>
                    </div>
                    {pendingCount > 0 && (
                        <div className="alert alert-warning self-start mt-1 py-2 px-3">
                            <span className="font-semibold">{pendingCount} order{pendingCount > 1 ? 's' : ''} awaiting review</span>
                        </div>
                    )}
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {([
                        { tag: 'ORD-TOT', label: 'Total', value: meta.total, dot: 'bg-[var(--color-text-muted)]' },
                        { tag: 'ORD-PND', label: 'Pending', value: orders.filter(o => o.status === 'PENDING').length, dot: 'status-dot-warning' },
                        { tag: 'ORD-PRO', label: 'Processing', value: orders.filter(o => o.status === 'PROCESSING').length, dot: 'bg-[var(--color-info-500)]' },
                        { tag: 'ORD-DON', label: 'Completed', value: orders.filter(o => o.status === 'COMPLETED').length, dot: 'status-dot-success' },
                    ] as const).map(s => (
                        <div key={s.tag} className="stat-card glow-border-top">
                            <div className="flex items-center justify-between mb-3">
                                <span className="tag-code">{s.tag}</span>
                                <span className={`status-dot ${s.dot}`} />
                            </div>
                            <div className="stat-value">{s.value}</div>
                            <div className="stat-label mt-1">{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Table card */}
                <div className="card card-lg p-0 overflow-hidden">
                    <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-[var(--color-surface-300)] flex-wrap">
                        <div className="flex items-center gap-3">
                            <h2 className="text-heading-sm">All Orders</h2>
                            <span className="badge badge-muted">{meta.total}</span>
                        </div>
                        <StatusFilter searchParams={searchParams} />
                    </div>

                    <div className="table-wrap border-0 rounded-none">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Order</th><th>Customer</th><th>Items</th>
                                    <th>Total</th><th>Status</th><th>Payment</th>
                                    <th className="text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.length === 0 ? (
                                    <tr><td colSpan={7} className="text-center py-16">
                                        <div className="flex flex-col items-center gap-3">
                                            <span className="tag-code text-base px-4 py-2">ORD-000</span>
                                            <p className="text-heading-sm text-[var(--color-text-muted)]">No orders found</p>
                                        </div>
                                    </td></tr>
                                ) : orders.map(o => (
                                    <OrderRow key={o.id} order={o} searchParams={searchParams} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <Pagination meta={meta} searchParams={searchParams} />
                </div>
            </div>

            {/* Order detail + tracking modal */}
            {searchParams.modal && <OrderModal orderId={searchParams.modal} />}
        </div>
    );
}
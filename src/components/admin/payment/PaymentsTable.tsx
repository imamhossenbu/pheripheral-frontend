import Link from 'next/link';
import {
    Payment,
    PaginationMeta,
    PaymentTransactionStatus,
    PaymentMethod,
    formatCurrency,
    formatDate,
    STATUS_LABELS,
    METHOD_LABELS,
} from '@/lib/api/payment-api';

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: PaymentTransactionStatus }) {
    const cls: Record<PaymentTransactionStatus, string> = {
        SUCCESS: 'badge badge-success',
        PENDING: 'badge badge-warning',
        FAILED: 'badge badge-danger',
        REFUNDED: 'badge badge-info',
    };
    const dot: Record<PaymentTransactionStatus, string> = {
        SUCCESS: 'status-dot status-dot-success',
        PENDING: 'status-dot status-dot-warning',
        FAILED: 'status-dot status-dot-danger',
        REFUNDED: 'status-dot bg-[var(--color-info-500)]',
    };
    return (
        <span className={cls[status]}>
            <span className={dot[status]} />
            {STATUS_LABELS[status]}
        </span>
    );
}

function UserCell({ user }: { user: Payment['user'] }) {
    const initials =
        [user.firstName?.[0], user.lastName?.[0]].filter(Boolean).join('').toUpperCase() ||
        user.email[0].toUpperCase();
    const name =
        [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email;

    return (
        <div className="flex items-center gap-2.5">
            <div className="avatar avatar-sm">{initials}</div>
            <div className="min-w-0">
                <div className="text-sm font-medium text-[var(--color-text-primary)] truncate max-w-[140px]" title={name}>
                    {name}
                </div>
                {user.department && (
                    <div className="text-caption truncate max-w-[140px]">{user.department}</div>
                )}
            </div>
        </div>
    );
}

function Pagination({
    meta,
    searchParams,
}: {
    meta: PaginationMeta;
    searchParams: Record<string, string | undefined>;
}) {
    if (meta.totalPages <= 1) return null;

    const href = (page: number) => {
        const p = new URLSearchParams(
            Object.entries(searchParams).filter(([, v]) => !!v) as [string, string][],
        );
        p.set('page', String(page));
        return `/admin/payments?${p}`;
    };

    const pages = Array.from({ length: meta.totalPages }, (_, i) => i + 1).filter(
        (p) => p === 1 || p === meta.totalPages || Math.abs(p - meta.page) <= 2,
    );

    return (
        <div className="flex items-center justify-between px-5 py-4 border-t border-[var(--color-surface-300)]">
            <p className="text-caption">
                {(meta.page - 1) * meta.limit + 1}–{Math.min(meta.page * meta.limit, meta.total)}{' '}
                of {meta.total}
            </p>
            <div className="flex items-center gap-1">
                <Link href={href(meta.page - 1)} aria-disabled={meta.page === 1}
                    className={`btn btn-icon btn-xs ${meta.page === 1 ? 'pointer-events-none opacity-40' : ''}`}>
                    ‹
                </Link>
                {pages.map((p, i) => {
                    const prev = pages[i - 1];
                    return (
                        <span key={p} className="flex items-center gap-1">
                            {prev && p - prev > 1 && <span className="text-caption px-1">…</span>}
                            <Link href={href(p)} className={`btn btn-xs ${p === meta.page ? 'btn-primary' : 'btn-ghost'}`}>
                                {p}
                            </Link>
                        </span>
                    );
                })}
                <Link href={href(meta.page + 1)} aria-disabled={meta.page === meta.totalPages}
                    className={`btn btn-icon btn-xs ${meta.page === meta.totalPages ? 'pointer-events-none opacity-40' : ''}`}>
                    ›
                </Link>
            </div>
        </div>
    );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

interface PaymentsTableProps {
    payments: Payment[];
    meta: PaginationMeta;
    searchParams: Record<string, string | undefined>;
}

export function PaymentsTable({ payments, meta, searchParams }: PaymentsTableProps) {
    return (
        <div>
            <div className="table-wrap border-0 rounded-none">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Transaction</th>
                            <th>User</th>
                            <th>Order</th>
                            <th>Amount</th>
                            <th>Method</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th className="text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payments.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="text-center py-16">
                                    <div className="flex flex-col items-center gap-3">
                                        <span className="tag-code text-base px-4 py-2">PMT-000</span>
                                        <p className="text-heading-sm text-[var(--color-text-muted)]">No payments found</p>
                                        <p className="text-caption">Try adjusting your filters.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            payments.map((payment) => (
                                <tr key={payment.id}>
                                    <td>
                                        <div className="flex flex-col gap-0.5">
                                            {payment.transactionId
                                                ? <span className="text-mono text-xs">{payment.transactionId}</span>
                                                : <span className="text-caption italic">No TXN ID</span>}
                                            {payment.provider && (
                                                <span className="text-caption">{payment.provider}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td><UserCell user={payment.user} /></td>
                                    <td>
                                        <Link
                                            href={`/admin/orders/${payment.orderId}`}
                                            className="text-[var(--color-accent-500)] hover:underline text-sm font-medium"
                                        >
                                            {payment.order?.orderNumber ?? `#${payment.orderId.slice(-6)}`}
                                        </Link>
                                    </td>
                                    <td>
                                        <span className="font-semibold text-[var(--color-text-primary)] tabular-nums">
                                            {formatCurrency(payment.amount)}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="badge badge-muted text-[10px] tracking-wide">
                                            {METHOD_LABELS[payment.method]}
                                        </span>
                                    </td>
                                    <td><StatusBadge status={payment.status} /></td>
                                    <td>
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-sm">{formatDate(payment.paidAt ?? payment.createdAt)}</span>
                                            {payment.paidAt && <span className="text-caption">Paid</span>}
                                        </div>
                                    </td>
                                    <td className="text-right">
                                        {/* View button — triggers modal via URL search param */}
                                        <Link
                                            href={`/admin/payments?${new URLSearchParams({
                                                ...Object.fromEntries(
                                                    Object.entries(searchParams).filter(([, v]) => !!v) as [string, string][]
                                                ),
                                                modal: payment.id,
                                            })}`}
                                            className="btn btn-ghost btn-xs"
                                        >
                                            View
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            <Pagination meta={meta} searchParams={searchParams} />
        </div>
    );
}
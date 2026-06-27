'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Payment,
    PaymentMethod,
    PaymentTransactionStatus,
    UpdatePaymentPayload,
    clientFetchPayment,
    updatePayment,
    deletePayment,
    formatCurrency,
    formatDate,
    STATUS_LABELS,
    METHOD_LABELS,
} from '@/lib/api/payment-api';

// ─── Field ────────────────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-1">
            <span className="form-label">{label}</span>
            <div className="text-sm text-[var(--color-text-primary)]">{children}</div>
        </div>
    );
}

// ─── Status badge (inline, no import cycle) ───────────────────────────────────

function StatusBadge({ status }: { status: PaymentTransactionStatus }) {
    const cls: Record<PaymentTransactionStatus, string> = {
        SUCCESS: 'badge badge-success', PENDING: 'badge badge-warning',
        FAILED: 'badge badge-danger', REFUNDED: 'badge badge-info',
    };
    return <span className={cls[status]}>{STATUS_LABELS[status]}</span>;
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

type Tab = 'details' | 'edit';

// ─── Modal content ────────────────────────────────────────────────────────────

function ModalContent({
    payment,
    onClose,
    onUpdated,
    onDeleted,
}: {
    payment: Payment;
    onClose: () => void;
    onUpdated: (p: Payment) => void;
    onDeleted: () => void;
}) {
    const [tab, setTab] = useState<Tab>('details');
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [form, setForm] = useState<UpdatePaymentPayload>({
        amount: Number(payment.amount),
        method: payment.method,
        status: payment.status,
        transactionId: payment.transactionId ?? '',
        provider: payment.provider ?? '',
        notes: payment.notes ?? '',
    });

    const handleUpdate = async () => {
        setLoading(true);
        setError(null);
        try {
            const updated = await updatePayment(payment.id, form);
            onUpdated(updated);
            setTab('details');
        } catch (e: any) {
            setError(e?.message ?? 'Update failed.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        setLoading(true);
        setError(null);
        try {
            await deletePayment(payment.id);
            onDeleted();
        } catch (e: any) {
            setError(e?.message ?? 'Delete failed.');
            setConfirmDelete(false);
        } finally {
            setLoading(false);
        }
    };

    const userDisplay =
        [payment.user.firstName, payment.user.lastName].filter(Boolean).join(' ') ||
        payment.user.email;
    const initials =
        [payment.user.firstName?.[0], payment.user.lastName?.[0]].filter(Boolean).join('').toUpperCase() ||
        payment.user.email[0].toUpperCase();

    return (
        <>
            {/* Modal header */}
            <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                    <span className="tag-code mb-2 inline-block">
                        {payment.transactionId ?? `ID:${payment.id.slice(-10)}`}
                    </span>
                    <h2 className="text-heading-md">{formatCurrency(payment.amount)}</h2>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <StatusBadge status={payment.status} />
                        <span className="badge badge-muted text-[10px]">{METHOD_LABELS[payment.method]}</span>
                        {payment.provider && (
                            <span className="badge badge-muted text-[10px]">{payment.provider}</span>
                        )}
                    </div>
                </div>
                <button className="btn btn-icon btn-sm flex-shrink-0" onClick={onClose} aria-label="Close">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                    </svg>
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-5 p-1 bg-[var(--color-surface-100)] rounded-md w-fit">
                {(['details', 'edit'] as Tab[]).map((t) => (
                    <button
                        key={t}
                        onClick={() => { setTab(t); setError(null); }}
                        className={`btn btn-xs capitalize ${tab === t ? 'btn-primary' : 'btn-ghost border-0'}`}
                    >
                        {t === 'details' ? 'Details' : 'Edit'}
                    </button>
                ))}
            </div>

            {error && (
                <div className="alert alert-danger mb-4">
                    <span>{error}</span>
                </div>
            )}

            {/* ── Details tab ── */}
            {tab === 'details' && (
                <div className="space-y-5">
                    {/* Payment info */}
                    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                        <Field label="Amount">{formatCurrency(payment.amount)}</Field>
                        <Field label="Method">{METHOD_LABELS[payment.method]}</Field>
                        <Field label="Status"><StatusBadge status={payment.status} /></Field>
                        <Field label="Paid At">{formatDate(payment.paidAt)}</Field>
                        <Field label="Transaction ID">
                            {payment.transactionId
                                ? <span className="text-mono break-all">{payment.transactionId}</span>
                                : <span className="text-caption italic">—</span>}
                        </Field>
                        <Field label="Provider">
                            {payment.provider ?? <span className="text-caption italic">—</span>}
                        </Field>
                        <Field label="Created">{formatDate(payment.createdAt)}</Field>
                        <Field label="Updated">{formatDate(payment.updatedAt)}</Field>
                    </div>

                    {payment.notes && (
                        <div>
                            <span className="form-label">Notes</span>
                            <p className="text-sm text-[var(--color-text-secondary)] bg-[var(--color-surface-100)] rounded px-3 py-2 mt-1 leading-relaxed">
                                {payment.notes}
                            </p>
                        </div>
                    )}

                    <hr className="divider" />

                    {/* User */}
                    <div>
                        <span className="form-label mb-2 block">User</span>
                        <div className="flex items-center gap-3">
                            <div className="avatar avatar-md">{initials}</div>
                            <div>
                                <div className="font-medium text-[var(--color-text-primary)] text-sm">{userDisplay}</div>
                                <div className="text-caption">{payment.user.email}</div>
                                {payment.user.department && (
                                    <span className="tag-code mt-1 inline-block">{payment.user.department}</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Order */}
                    <div>
                        <span className="form-label mb-2 block">Order</span>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                            <Field label="Order Number">
                                <a
                                    href={`/admin/orders/${payment.orderId}`}
                                    className="text-[var(--color-accent-500)] hover:underline font-medium"
                                >
                                    {payment.order?.orderNumber ?? `#${payment.orderId.slice(-6)}`}
                                </a>
                            </Field>
                            <Field label="Order Total">{formatCurrency(payment.order?.total ?? 0)}</Field>
                            <Field label="Payment Status">{payment.order?.paymentStatus ?? '—'}</Field>
                        </div>
                    </div>

                    {/* Footer actions */}
                    <div className="flex justify-between items-center pt-2">
                        {!confirmDelete ? (
                            <button
                                className="btn btn-danger btn-sm"
                                onClick={() => setConfirmDelete(true)}
                            >
                                Delete
                            </button>
                        ) : (
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-[var(--color-danger-500)]">Sure?</span>
                                <button className="btn btn-danger btn-xs" onClick={handleDelete} disabled={loading}>
                                    {loading ? 'Deleting…' : 'Yes, delete'}
                                </button>
                                <button className="btn btn-ghost btn-xs" onClick={() => setConfirmDelete(false)}>
                                    Cancel
                                </button>
                            </div>
                        )}
                        <button className="btn btn-secondary btn-sm" onClick={() => setTab('edit')}>
                            Edit Payment
                        </button>
                    </div>
                </div>
            )}

            {/* ── Edit tab ── */}
            {tab === 'edit' && (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="form-label" htmlFor="f-amount">Amount (BDT)</label>
                            <input id="f-amount" type="number" min={0} step={0.01} className="input"
                                value={form.amount}
                                onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} />
                        </div>
                        <div>
                            <label className="form-label" htmlFor="f-method">Method</label>
                            <select id="f-method" className="input select" value={form.method}
                                onChange={(e) => setForm({ ...form, method: e.target.value as PaymentMethod })}>
                                {Object.entries(METHOD_LABELS).map(([v, l]) => (
                                    <option key={v} value={v}>{l}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="form-label" htmlFor="f-status">Status</label>
                            <select id="f-status" className="input select" value={form.status}
                                onChange={(e) => setForm({ ...form, status: e.target.value as PaymentTransactionStatus })}>
                                {Object.entries(STATUS_LABELS).map(([v, l]) => (
                                    <option key={v} value={v}>{l}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="form-label" htmlFor="f-txn">Transaction ID</label>
                            <input id="f-txn" type="text" className="input font-mono text-xs" placeholder="PX-…"
                                value={form.transactionId}
                                onChange={(e) => setForm({ ...form, transactionId: e.target.value })} />
                        </div>
                        <div>
                            <label className="form-label" htmlFor="f-provider">Provider</label>
                            <input id="f-provider" type="text" className="input" placeholder="e.g. SSLCOMMERZ"
                                value={form.provider}
                                onChange={(e) => setForm({ ...form, provider: e.target.value })} />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="form-label" htmlFor="f-notes">Notes</label>
                            <textarea id="f-notes" rows={3} className="input resize-none"
                                placeholder="Internal notes…"
                                value={form.notes}
                                onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-[var(--color-surface-300)]">
                        <button className="btn btn-ghost btn-sm" onClick={() => setTab('details')} disabled={loading}>
                            Cancel
                        </button>
                        <button className="btn btn-primary btn-sm" onClick={handleUpdate} disabled={loading}>
                            {loading ? 'Saving…' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

// ─── Loader state ─────────────────────────────────────────────────────────────

function ModalSkeleton() {
    return (
        <div className="space-y-4 animate-pulse">
            <div className="skeleton h-6 w-32 rounded" />
            <div className="skeleton h-8 w-48 rounded" />
            <div className="grid grid-cols-2 gap-4 mt-4">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="skeleton h-10 rounded" />
                ))}
            </div>
        </div>
    );
}

// ─── Exported modal wrapper ────────────────────────────────────────────────────

interface PaymentModalProps {
    paymentId: string;
}

export function PaymentModal({ paymentId }: PaymentModalProps) {
    const router = useRouter();
    const overlayRef = useRef<HTMLDivElement>(null);
    const [payment, setPayment] = useState<Payment | null>(null);
    const [fetchError, setFetchError] = useState<string | null>(null);

    // Close: remove modal param from URL
    const close = () => {
        const url = new URL(window.location.href);
        url.searchParams.delete('modal');
        router.replace(url.pathname + (url.search || ''), { scroll: false });
    };

    // Escape key
    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, []);

    // Fetch payment data
    useEffect(() => {
        setPayment(null);
        setFetchError(null);
        clientFetchPayment(paymentId)
            .then(setPayment)
            .catch((e) => setFetchError(e?.message ?? 'Failed to load payment.'));
    }, [paymentId]);

    // Click outside to close
    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === overlayRef.current) close();
    };

    return (
        <div
            ref={overlayRef}
            className="modal-overlay"
            onClick={handleOverlayClick}
            role="dialog"
            aria-modal="true"
            aria-label="Payment details"
        >
            <div className="modal max-w-[680px] max-h-[90dvh] overflow-y-auto">
                {fetchError ? (
                    <div className="alert alert-danger">
                        <span>{fetchError}</span>
                    </div>
                ) : !payment ? (
                    <ModalSkeleton />
                ) : (
                    <ModalContent
                        payment={payment}
                        onClose={close}
                        onUpdated={(updated) => {
                            setPayment(updated);
                            router.refresh();
                        }}
                        onDeleted={() => {
                            close();
                            router.refresh();
                        }}
                    />
                )}
            </div>
        </div>
    );
}
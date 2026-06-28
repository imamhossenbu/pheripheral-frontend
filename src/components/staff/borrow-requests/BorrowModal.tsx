'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    BorrowRequest, clientFetchBorrow, reviewBorrow,
    BORROW_STATUS_LABEL, BORROW_STATUS_BADGE, formatDate,
} from '@/lib/staff/borrow-api';

function CloseBtn({ onClick }: { onClick: () => void }) {
    return (
        <button className="btn btn-icon btn-sm" onClick={onClick}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            </svg>
        </button>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-1">
            <span className="form-label">{label}</span>
            <div className="text-sm text-[var(--color-text-primary)]">{children}</div>
        </div>
    );
}

function ReviewPanel({ borrow, onReviewed }: {
    borrow: BorrowRequest;
    onReviewed: (b: BorrowRequest) => void;
}) {
    const [action, setAction] = useState<'APPROVED' | 'REJECTED' | null>(null);
    const [note, setNote] = useState(borrow.adminNote ?? '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const submit = async () => {
        if (!action) return;
        setLoading(true); setError(null);
        try {
            const updated = await reviewBorrow(borrow.id, { status: action, adminNote: note });
            onReviewed(updated);
        } catch (e: any) {
            setError(e?.message ?? 'Failed.');
        } finally { setLoading(false); }
    };

    return (
        <div className="space-y-3">
            {error && <div className="alert alert-danger text-sm"><span>{error}</span></div>}

            <div className="flex gap-2">
                <button
                    onClick={() => setAction('APPROVED')}
                    className={`btn btn-sm flex-1 ${action === 'APPROVED' ? 'btn-primary' : 'btn-ghost'}`}
                >
                    ✓ Approve
                </button>
                <button
                    onClick={() => setAction('REJECTED')}
                    className={`btn btn-sm flex-1 ${action === 'REJECTED' ? 'btn-danger' : 'btn-ghost'}`}
                >
                    ✕ Reject
                </button>
            </div>

            {action && (
                <>
                    <div>
                        <label className="form-label" htmlFor="admin-note">
                            Note to student <span className="text-caption font-normal">(optional)</span>
                        </label>
                        <textarea
                            id="admin-note"
                            rows={3}
                            className="input resize-none text-sm"
                            placeholder={action === 'APPROVED'
                                ? 'e.g. Please collect from Lab 3 on your start date.'
                                : 'e.g. Device is currently in maintenance.'}
                            value={note}
                            onChange={e => setNote(e.target.value)}
                        />
                    </div>
                    <button
                        className={`btn btn-sm w-full ${action === 'APPROVED' ? 'btn-primary' : 'btn-danger'}`}
                        onClick={submit}
                        disabled={loading}
                    >
                        {loading ? 'Submitting…' : `Confirm ${action === 'APPROVED' ? 'Approval' : 'Rejection'}`}
                    </button>
                </>
            )}
        </div>
    );
}

function ModalContent({ borrow: initial, onClose, onUpdated }: {
    borrow: BorrowRequest;
    onClose: () => void;
    onUpdated: () => void;
}) {
    const [borrow, setBorrow] = useState(initial);
    const isPending = borrow.status === 'PENDING';

    const name = [borrow.user.firstName, borrow.user.lastName].filter(Boolean).join(' ') || borrow.user.email;
    const initials = [borrow.user.firstName?.[0], borrow.user.lastName?.[0]].filter(Boolean).join('').toUpperCase()
        || borrow.user.email[0].toUpperCase();

    // Days duration
    const days = Math.ceil(
        (new Date(borrow.endDate).getTime() - new Date(borrow.startDate).getTime()) / 86400000
    );

    return (
        <>
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                    <span className="tag-code mb-2 inline-block">BRW-{borrow.id.slice(-8).toUpperCase()}</span>
                    <h2 className="text-heading-md">{borrow.device.name}</h2>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className={BORROW_STATUS_BADGE[borrow.status]}>{BORROW_STATUS_LABEL[borrow.status]}</span>
                        <span className="badge badge-muted">{days} day{days !== 1 ? 's' : ''}</span>
                        {borrow.device.brand && <span className="badge badge-muted">{borrow.device.brand}</span>}
                    </div>
                </div>
                <CloseBtn onClick={onClose} />
            </div>

            {/* Review action — only for pending */}
            {isPending && (
                <div className="card p-4 mb-5 border-[var(--color-warning-400)]">
                    <p className="form-label mb-3">Review this request</p>
                    <ReviewPanel
                        borrow={borrow}
                        onReviewed={(updated) => { setBorrow(updated); onUpdated(); }}
                    />
                </div>
            )}

            {/* Admin note (if reviewed) */}
            {borrow.adminNote && !isPending && (
                <div className="alert alert-info mb-4">
                    <div>
                        <p className="font-medium text-sm">Staff Note</p>
                        <p className="text-sm mt-0.5">{borrow.adminNote}</p>
                    </div>
                </div>
            )}

            {/* Details grid */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                {/* Student */}
                <div className="col-span-2">
                    <span className="form-label mb-2 block">Student</span>
                    <div className="flex items-center gap-3">
                        <div className="avatar avatar-md">{initials}</div>
                        <div>
                            <p className="text-sm font-medium text-[var(--color-text-primary)]">{name}</p>
                            <p className="text-caption">{borrow.user.email}</p>
                            {borrow.user.department && <span className="tag-code mt-1 inline-block">{borrow.user.department}</span>}
                        </div>
                    </div>
                </div>

                <Field label="Device">
                    <span className="font-medium">{borrow.device.name}</span>
                    <span className="text-caption block">{borrow.device.brand} · {borrow.device.model}</span>
                </Field>
                {borrow.variant && <Field label="Variant">{borrow.variant.name}</Field>}
                <Field label="Start Date">{formatDate(borrow.startDate)}</Field>
                <Field label="End Date">{formatDate(borrow.endDate)}</Field>
                <Field label="Duration">{days} day{days !== 1 ? 's' : ''}</Field>
                <Field label="Requested">{formatDate(borrow.createdAt)}</Field>
                {borrow.returnedAt && <Field label="Returned">{formatDate(borrow.returnedAt)}</Field>}

                <div className="col-span-2">
                    <Field label="Reason">
                        <p className="text-sm text-[var(--color-text-secondary)] bg-[var(--color-surface-100)] rounded px-3 py-2 mt-0.5 leading-relaxed">
                            {borrow.reason}
                        </p>
                    </Field>
                </div>
            </div>
        </>
    );
}

function Skeleton() {
    return (
        <div className="space-y-4 animate-pulse">
            <div className="skeleton h-5 w-32 rounded" />
            <div className="skeleton h-7 w-56 rounded" />
            <div className="skeleton h-20 rounded" />
            <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-10 rounded" />)}
            </div>
        </div>
    );
}

export function BorrowModal({ borrowId }: { borrowId: string }) {
    const router = useRouter();
    const overlayRef = useRef<HTMLDivElement>(null);
    const [borrow, setBorrow] = useState<BorrowRequest | null>(null);
    const [err, setErr] = useState<string | null>(null);

    const close = useCallback(() => {
        const url = new URL(window.location.href);
        url.searchParams.delete('modal');
        router.replace(url.pathname + (url.search || ''), { scroll: false });
    }, [router]);

    useEffect(() => {
        const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
        document.addEventListener('keydown', fn);
        return () => document.removeEventListener('keydown', fn);
    }, [close]);

    useEffect(() => {
        setBorrow(null); setErr(null);
        clientFetchBorrow(borrowId).then(setBorrow).catch(e => setErr(e?.message ?? 'Failed.'));
    }, [borrowId]);

    return (
        <div
            ref={overlayRef}
            className="modal-overlay"
            onClick={e => { if (e.target === overlayRef.current) close(); }}
            role="dialog" aria-modal="true"
        >
            <div className="modal max-w-[600px] max-h-[90dvh] overflow-y-auto">
                {err
                    ? <div className="alert alert-danger"><span>{err}</span></div>
                    : !borrow
                        ? <Skeleton />
                        : <ModalContent borrow={borrow} onClose={close} onUpdated={() => router.refresh()} />
                }
            </div>
        </div>
    );
}
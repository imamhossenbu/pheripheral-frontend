'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Order, OrderTracking, OrderMessage, TrackingStage,
    clientFetchOrder, updateOrder, postTracking, fetchMessages,
    formatCurrency, formatDate, formatRelative,
    ORDER_STATUS_LABEL, ORDER_STATUS_BADGE,
    PAYMENT_STATUS_LABEL, PAYMENT_STATUS_BADGE,
    TRACKING_STAGE_LABEL, TRACKING_STAGES,
    sendMessage
} from '@/lib/staff/order-api';
import { getCurrentUser } from '@/lib/api';

// ─── Small helpers ────────────────────────────────────────────────────────────

function CloseBtn({ onClick }: { onClick: () => void }) {
    return (
        <button className="btn btn-icon btn-sm flex-shrink-0" onClick={onClick}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            </svg>
        </button>
    );
}

function StarRating({ rating }: { rating: number }) {
    return (
        <span className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map(i => (
                <span key={i} className={i <= rating ? 'text-[var(--color-warning-400)]' : 'text-[var(--color-surface-300)]'}>★</span>
            ))}
        </span>
    );
}

// ─── Tracking Timeline ────────────────────────────────────────────────────────

function TrackingTimeline({ updates }: { updates: OrderTracking[] }) {
    const latest = updates[0];

    return (
        <div className="space-y-1">
            {TRACKING_STAGES.map((stage, idx) => {
                const done = updates.some(u => u.stage === stage);
                const isLatest = latest?.stage === stage;
                const stageIdx = TRACKING_STAGES.indexOf(stage);
                const latestIdx = latest ? TRACKING_STAGES.indexOf(latest.stage) : -1;
                const past = stageIdx <= latestIdx;
                const update = updates.find(u => u.stage === stage);

                return (
                    <div key={stage} className="flex items-start gap-3">
                        {/* dot + line */}
                        <div className="flex flex-col items-center flex-shrink-0 mt-1">
                            <div className={`w-3 h-3 rounded-full border-2 flex-shrink-0 ${isLatest
                                ? 'bg-[var(--color-brand-500)] border-[var(--color-brand-500)]'
                                : past
                                    ? 'bg-[var(--color-success-500)] border-[var(--color-success-500)]'
                                    : 'bg-white border-[var(--color-surface-300)]'
                                }`} />
                            {idx < TRACKING_STAGES.length - 1 && (
                                <div className={`w-0.5 h-6 mt-0.5 ${past ? 'bg-[var(--color-success-500)]' : 'bg-[var(--color-surface-300)]'}`} />
                            )}
                        </div>
                        {/* label */}
                        <div className="pb-2 min-w-0">
                            <p className={`text-sm font-medium ${past ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-muted)]'}`}>
                                {TRACKING_STAGE_LABEL[stage]}
                                {isLatest && (
                                    <span className="ml-2 inline-flex items-center gap-1">
                                        <span className="status-dot status-dot-success animate-ping" />
                                        <span className="text-xs text-[var(--color-success-500)] font-normal">Live</span>
                                    </span>
                                )}
                            </p>
                            {update && (
                                <p className="text-caption mt-0.5">
                                    {formatRelative(update.recordedAt)}
                                    {update.note && ` · ${update.note}`}
                                </p>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// ─── Live Location Sender ─────────────────────────────────────────────────────

function LocationSender({ orderId, currentStage, onSent }: {
    orderId: string;
    currentStage: TrackingStage | null;
    onSent: (t: OrderTracking) => void;
}) {
    const [stage, setStage] = useState<TrackingStage>(currentStage ?? 'PREPARING');
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [watching, setWatching] = useState(false);
    const watchRef = useRef<number | null>(null);

    const sendLocation = useCallback((lat: number, lng: number) => {
        setLoading(true);
        setError(null);
        postTracking(orderId, { latitude: lat, longitude: lng, stage, note })
            .then((t) => { onSent(t); setNote(''); })
            .catch((e) => setError(e?.message ?? 'Failed to send location.'))
            .finally(() => setLoading(false));
    }, [orderId, stage, note, onSent]);

    const handleManual = () => {
        navigator.geolocation.getCurrentPosition(
            (pos) => sendLocation(pos.coords.latitude, pos.coords.longitude),
            () => setError('Location permission denied.'),
        );
    };

    const toggleLive = () => {
        if (watching) {
            if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current);
            watchRef.current = null;
            setWatching(false);
        } else {
            watchRef.current = navigator.geolocation.watchPosition(
                (pos) => sendLocation(pos.coords.latitude, pos.coords.longitude),
                () => setError('Location permission denied.'),
                { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 },
            );
            setWatching(true);
        }
    };

    useEffect(() => () => {
        if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current);
    }, []);

    return (
        <div className="card p-4 space-y-3">
            <h4 className="text-label uppercase tracking-widest text-[var(--color-text-muted)]">Send Location Update</h4>

            {error && <div className="alert alert-danger py-2 text-xs"><span>{error}</span></div>}

            {/* Stage selector */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {TRACKING_STAGES.filter(s => s !== 'PLACED').map(s => (
                    <button
                        key={s}
                        onClick={() => setStage(s)}
                        className={`btn btn-xs text-left justify-start ${stage === s ? 'btn-primary' : 'btn-ghost'}`}
                    >
                        {TRACKING_STAGE_LABEL[s]}
                    </button>
                ))}
            </div>

            {/* Note */}
            <input
                type="text"
                className="input text-sm"
                placeholder="Optional note (e.g. arriving in 10 min)"
                value={note}
                onChange={e => setNote(e.target.value)}
            />

            {/* Actions */}
            <div className="flex gap-2">
                <button className="btn btn-secondary btn-sm flex-1" onClick={handleManual} disabled={loading || watching}>
                    {loading ? 'Sending…' : '📍 Send Once'}
                </button>
                <button
                    className={`btn btn-sm flex-1 ${watching ? 'btn-danger' : 'btn-primary'}`}
                    onClick={toggleLive}
                >
                    {watching ? '⏹ Stop Live' : '🔴 Go Live'}
                </button>
            </div>

            {watching && (
                <p className="text-caption text-center animate-pulse">
                    Live location sharing active — your position updates automatically
                </p>
            )}
        </div>
    );
}

// ─── Order Chat ───────────────────────────────────────────────────────────────

function OrderChat({ orderId }: { orderId: string }) {
    const [messages, setMessages] = useState<OrderMessage[]>([]);
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);
    const me = getCurrentUser<{ userId: string; role: string }>();

    useEffect(() => {
        fetchMessages(orderId, 50).then(setMessages).catch(() => { });
    }, [orderId]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Poll every 8 seconds for new messages
    useEffect(() => {
        const id = setInterval(() => {
            fetchMessages(orderId, 50).then(setMessages).catch(() => { });
        }, 8000);
        return () => clearInterval(id);
    }, [orderId]);

    const send = async () => {
        if (!text.trim()) return;

        setLoading(true);

        try {
            const msg = await sendMessage(orderId, {
                message: text,
            });

            setMessages(prev => [...prev, msg]);
            setText("");
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const senderName = (m: OrderMessage) =>
        [m.sender.firstName, m.sender.lastName].filter(Boolean).join(' ') || 'User';

    return (
        <div className="flex flex-col h-[280px]">
            {/* messages */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 py-2">
                {messages.length === 0 && (
                    <p className="text-caption text-center mt-8">No messages yet. Start the conversation.</p>
                )}
                {messages.map(m => {
                    const isMe = m.senderId === me?.userId;
                    return (
                        <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${isMe
                                ? 'bg-[var(--color-brand-500)] text-white'
                                : 'bg-[var(--color-surface-100)] text-[var(--color-text-primary)]'
                                }`}>
                                {!isMe && (
                                    <p className="text-[10px] font-semibold mb-0.5 opacity-60">{senderName(m)}</p>
                                )}
                                <p className="leading-snug">{m.message}</p>
                                <p className={`text-[10px] mt-0.5 ${isMe ? 'text-white/60' : 'text-[var(--color-text-muted)]'}`}>
                                    {formatRelative(m.createdAt)}
                                </p>
                            </div>
                        </div>
                    );
                })}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="flex gap-2 pt-2 border-t border-[var(--color-surface-300)]">
                <input
                    type="text"
                    className="input text-sm flex-1"
                    placeholder="Type a message…"
                    value={text}
                    onChange={e => setText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                />
                <button className="btn btn-primary btn-sm" onClick={send} disabled={loading || !text.trim()}>
                    Send
                </button>
            </div>
        </div>
    );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

type Tab = 'overview' | 'tracking' | 'chat';

// ─── Modal Content ────────────────────────────────────────────────────────────

function ModalContent({ order: initial, onClose, onUpdated }: {
    order: Order;
    onClose: () => void;
    onUpdated: () => void;
}) {
    const [order, setOrder] = useState(initial);
    const [tab, setTab] = useState<Tab>('overview');
    const [tracking, setTracking] = useState<OrderTracking[]>(initial.trackingUpdates ?? []);
    const [statusLoading, setStatusLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const latestStage = tracking[0]?.stage ?? null;

    const handleStatusChange = async (status: Order['status']) => {
        setStatusLoading(true); setError(null);
        try {
            const updated = await updateOrder(order.id, { status });
            setOrder(updated);
            onUpdated();
            if (status === 'PROCESSING' && tab !== 'tracking') setTab('tracking');
        } catch (e: any) {
            setError(e?.message ?? 'Failed to update status.');
        } finally { setStatusLoading(false); }
    };

    const handleTrackingSent = (t: OrderTracking) => {
        setTracking(prev => [t, ...prev]);
    };

    const name = [order.user.firstName, order.user.lastName].filter(Boolean).join(' ') || order.user.email;
    const initials = [order.user.firstName?.[0], order.user.lastName?.[0]].filter(Boolean).join('').toUpperCase()
        || order.user.email[0].toUpperCase();

    return (
        <>
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                    <span className="tag-code mb-2 inline-block">{order.orderNumber}</span>
                    <h2 className="text-heading-md">{formatCurrency(order.total)}</h2>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className={ORDER_STATUS_BADGE[order.status]}>{ORDER_STATUS_LABEL[order.status]}</span>
                        <span className={PAYMENT_STATUS_BADGE[order.paymentStatus]}>{PAYMENT_STATUS_LABEL[order.paymentStatus]}</span>
                    </div>
                </div>
                <CloseBtn onClick={onClose} />
            </div>

            {/* Quick status actions */}
            {order.status === 'PENDING' && (
                <div className="alert alert-warning mb-4 flex-col gap-2">
                    <p className="font-medium text-sm">This order needs your review.</p>
                    <div className="flex gap-2">
                        <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleStatusChange('PROCESSING')}
                            disabled={statusLoading}
                        >
                            {statusLoading ? '…' : '✓ Accept & Start Processing'}
                        </button>
                        <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleStatusChange('CANCELLED')}
                            disabled={statusLoading}
                        >
                            ✕ Cancel
                        </button>
                    </div>
                </div>
            )}

            {order.status === 'PROCESSING' && (
                <div className="alert alert-info mb-4 flex items-center justify-between flex-wrap gap-2">
                    <p className="text-sm font-medium">Order in progress — share live location below.</p>
                    <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleStatusChange('COMPLETED')}
                        disabled={statusLoading}
                    >
                        ✓ Mark Delivered
                    </button>
                </div>
            )}

            {error && <div className="alert alert-danger mb-3"><span>{error}</span></div>}

            {/* Tabs */}
            <div className="flex gap-1 mb-4 p-1 bg-[var(--color-surface-100)] rounded-md w-fit">
                {(['overview', 'tracking', 'chat'] as Tab[]).map(t => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`btn btn-xs capitalize ${tab === t ? 'btn-primary' : 'btn-ghost border-0'}`}
                    >
                        {t === 'overview' ? 'Overview' : t === 'tracking' ? '📍 Tracking' : '💬 Chat'}
                    </button>
                ))}
            </div>

            {/* ── Overview tab ── */}
            {tab === 'overview' && (
                <div className="space-y-5">
                    {/* Customer */}
                    <div>
                        <p className="form-label mb-2">Customer</p>
                        <div className="flex items-center gap-3">
                            <div className="avatar avatar-md">{initials}</div>
                            <div>
                                <p className="text-sm font-medium text-[var(--color-text-primary)]">{name}</p>
                                <p className="text-caption">{order.user.email}</p>
                                {order.user.department && <span className="tag-code mt-1 inline-block">{order.user.department}</span>}
                            </div>
                        </div>
                    </div>

                    <hr className="divider" />

                    {/* Items */}
                    <div>
                        <p className="form-label mb-2">Items</p>
                        <div className="space-y-2">
                            {order.items.map(item => (
                                <div key={item.id} className="flex items-center justify-between gap-4">
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                                            {item.device.name}
                                        </p>
                                        {item.variant && <p className="text-caption">{item.variant.name}</p>}
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <p className="text-sm font-semibold text-[var(--color-text-primary)] tabular-nums">
                                            {formatCurrency(item.total)}
                                        </p>
                                        <p className="text-caption">×{item.quantity}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <hr className="divider" />

                    {/* Totals */}
                    <div className="space-y-1.5 text-sm">
                        <div className="flex justify-between text-[var(--color-text-secondary)]">
                            <span>Subtotal</span><span className="tabular-nums">{formatCurrency(order.subtotal)}</span>
                        </div>
                        {Number(order.discount) > 0 && (
                            <div className="flex justify-between text-[var(--color-success-500)]">
                                <span>Discount</span><span>−{formatCurrency(order.discount)}</span>
                            </div>
                        )}
                        {Number(order.tax) > 0 && (
                            <div className="flex justify-between text-[var(--color-text-secondary)]">
                                <span>Tax</span><span>{formatCurrency(order.tax)}</span>
                            </div>
                        )}
                        <div className="flex justify-between font-semibold text-[var(--color-text-primary)] pt-1 border-t border-[var(--color-surface-300)]">
                            <span>Total</span><span className="tabular-nums">{formatCurrency(order.total)}</span>
                        </div>
                    </div>

                    {order.notes && (
                        <div>
                            <p className="form-label mb-1">Notes</p>
                            <p className="text-sm text-[var(--color-text-secondary)] bg-[var(--color-surface-100)] rounded px-3 py-2">
                                {order.notes}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* ── Tracking tab ── */}
            {tab === 'tracking' && (
                <div className="space-y-5">
                    <TrackingTimeline updates={tracking} />

                    {(order.status === 'PROCESSING' || order.status === 'PENDING') && (
                        <LocationSender
                            orderId={order.id}
                            currentStage={latestStage}
                            onSent={handleTrackingSent}
                        />
                    )}

                    {tracking.length === 0 && order.status !== 'PROCESSING' && (
                        <p className="text-caption text-center">No tracking updates yet.</p>
                    )}
                </div>
            )}

            {/* ── Chat tab ── */}
            {tab === 'chat' && <OrderChat orderId={order.id} />}
        </>
    );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton() {
    return (
        <div className="space-y-4 animate-pulse">
            <div className="skeleton h-5 w-32 rounded" />
            <div className="skeleton h-8 w-48 rounded" />
            <div className="skeleton h-14 rounded" />
            <div className="grid grid-cols-2 gap-4 mt-2">
                {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-10 rounded" />)}
            </div>
        </div>
    );
}

// ─── Exported wrapper ─────────────────────────────────────────────────────────

export function OrderModal({ orderId }: { orderId: string }) {
    const router = useRouter();
    const overlayRef = useRef<HTMLDivElement>(null);
    const [order, setOrder] = useState<Order | null>(null);
    const [fetchErr, setErr] = useState<string | null>(null);

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
        setOrder(null); setErr(null);
        clientFetchOrder(orderId).then(setOrder).catch(e => setErr(e?.message ?? 'Failed to load.'));
    }, [orderId]);

    return (
        <div
            ref={overlayRef}
            className="modal-overlay"
            onClick={e => { if (e.target === overlayRef.current) close(); }}
            role="dialog" aria-modal="true"
        >
            <div className="modal max-w-[680px] max-h-[90dvh] overflow-y-auto">
                {fetchErr
                    ? <div className="alert alert-danger"><span>{fetchErr}</span></div>
                    : !order
                        ? <Skeleton />
                        : <ModalContent order={order} onClose={close} onUpdated={() => router.refresh()} />
                }
            </div>
        </div>
    );
}
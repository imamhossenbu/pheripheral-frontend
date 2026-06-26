// components/admin/ui.tsx
// Pure display components — no client JS needed

import { ReactNode } from 'react';
import {
    DashboardStats,
    RecentLog,
    RecentUser,
    OverdueBorrow,
    LowStockVariant,
    TrendPoint,
} from '@/lib/api/adminApi';

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
    return new Intl.NumberFormat('en-US').format(n);
}

function fmtCurrency(n: number) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'BDT',
        maximumFractionDigits: 0,
    }).format(n);
}

function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

function fmtTime(iso: string) {
    return new Date(iso).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
    });
}

// ─── STAT CARD ─────────────────────────────────────────────────────────────────

interface StatCardProps {
    label: string;
    value: string | number;
    sub?: string;
    accent?: 'brand' | 'success' | 'warning' | 'danger' | 'accent';
    icon: ReactNode;
}

export function StatCard({ label, value, sub, accent = 'brand', icon }: StatCardProps) {
    const accentBar = {
        brand: 'bg-[var(--color-brand-500)]',
        success: 'bg-[var(--color-success-500)]',
        warning: 'bg-[var(--color-warning-400)]',
        danger: 'bg-[var(--color-danger-500)]',
        accent: 'bg-[var(--color-accent-500)]',
    }[accent];

    const iconBg = {
        brand: 'bg-[var(--color-brand-50)] text-[var(--color-brand-600)]',
        success: 'bg-[var(--color-success-50)] text-[var(--color-success-500)]',
        warning: 'bg-[var(--color-warning-50)] text-[var(--color-warning-500)]',
        danger: 'bg-[var(--color-danger-50)] text-[var(--color-danger-500)]',
        accent: 'bg-[var(--color-info-50)] text-[var(--color-info-500)]',
    }[accent];

    return (
        <div className="stat-card relative overflow-hidden">
            {/* accent top bar */}
            <div className={`absolute top-0 left-0 right-0 h-0.5 ${accentBar}`} />
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <p className="stat-label">{label}</p>
                    <p className="stat-value mt-2">{typeof value === 'number' ? fmt(value) : value}</p>
                    {sub && <p className="text-caption mt-1">{sub}</p>}
                </div>
                <div className={`p-2.5 rounded-[var(--radius-md)] flex-shrink-0 ${iconBg}`}>
                    {icon}
                </div>
            </div>
        </div>
    );
}

// ─── SECTION HEADER ────────────────────────────────────────────────────────────

export function SectionHeader({ title, sub }: { title: string; sub?: string }) {
    return (
        <div className="mb-4">
            <h2 className="text-heading-sm">{title}</h2>
            {sub && <p className="text-body-sm mt-0.5">{sub}</p>}
        </div>
    );
}

// ─── STATUS BADGE ──────────────────────────────────────────────────────────────

const STATUS_MAP: Record<string, string> = {
    AVAILABLE: 'badge-success',
    APPROVED: 'badge-success',
    COMPLETED: 'badge-success',
    PAID: 'badge-success',
    SUCCESS: 'badge-success',

    PENDING: 'badge-warning',
    PROCESSING: 'badge-warning',
    PARTIAL: 'badge-warning',
    IN_MAINTENANCE: 'badge-warning',
    UNPAID: 'badge-warning',

    REJECTED: 'badge-danger',
    CANCELLED: 'badge-danger',
    OVERDUE: 'badge-danger',
    RETIRED: 'badge-danger',

    RETURNED: 'badge-info',
    DEPLOYED: 'badge-info',
    WAIVED: 'badge-muted',
};

export function StatusBadge({ status }: { status: string }) {
    const cls = STATUS_MAP[status] ?? 'badge-muted';
    return (
        <span className={`badge ${cls}`}>
            {status.replace(/_/g, ' ')}
        </span>
    );
}

// ─── KPI GRID (top of dashboard) ──────────────────────────────────────────────

export function KpiGrid({ data }: { data: DashboardStats }) {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
                label="Total Users"
                value={data.counts.users}
                sub={`${data.usersByRole.STUDENT ?? 0} students · ${data.usersByRole.STAFF ?? 0} staff`}
                accent="brand"
                icon={<IconUsers />}
            />
            <StatCard
                label="Total Devices"
                value={data.counts.devices}
                sub={`${data.devicesByStatus.AVAILABLE} available`}
                accent="accent"
                icon={<IconDevices />}
            />
            <StatCard
                label="Inventory Value"
                value={fmtCurrency(data.totalInventoryValue)}
                accent="success"
                icon={<IconValue />}
            />
            <StatCard
                label="Pending Borrows"
                value={data.borrow.pendingCount}
                sub={data.borrow.overdueCount > 0 ? `${data.borrow.overdueCount} overdue` : 'None overdue'}
                accent={data.borrow.overdueCount > 0 ? 'danger' : 'brand'}
                icon={<IconBorrow />}
            />
        </div>
    );
}

// ─── BORROW STATUS BREAKDOWN ───────────────────────────────────────────────────

export function BorrowBreakdown({ data }: { data: DashboardStats['borrow'] }) {
    const total = Object.values(data.byStatus).reduce((a, b) => a + b, 0);

    const segments = [
        { label: 'Pending', count: data.byStatus.PENDING, color: 'bg-[var(--color-warning-400)]' },
        { label: 'Approved', count: data.byStatus.APPROVED, color: 'bg-[var(--color-success-400)]' },
        { label: 'Returned', count: data.byStatus.RETURNED, color: 'bg-[var(--color-accent-500)]' },
        { label: 'Rejected', count: data.byStatus.REJECTED, color: 'bg-[var(--color-danger-400)]' },
    ];

    return (
        <div className="card-flat">
            <SectionHeader title="Borrow Requests" sub={`${fmt(total)} total requests`} />

            {/* Segmented bar */}
            {total > 0 && (
                <div className="flex h-2 rounded-full overflow-hidden gap-0.5 mb-4">
                    {segments.map((s) =>
                        s.count > 0 ? (
                            <div
                                key={s.label}
                                className={`${s.color} transition-all`}
                                style={{ width: `${(s.count / total) * 100}%` }}
                            />
                        ) : null
                    )}
                </div>
            )}

            <div className="grid grid-cols-2 gap-3">
                {segments.map((s) => (
                    <div key={s.label} className="flex items-center gap-2">
                        <span className={`status-dot ${s.color} rounded-full`} />
                        <span className="text-body-sm flex-1">{s.label}</span>
                        <span className="font-semibold text-[var(--color-text-primary)] text-sm">{s.count}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── DEVICE STATUS BREAKDOWN ───────────────────────────────────────────────────

export function DeviceStatusBreakdown({ data }: { data: DashboardStats['devicesByStatus'] }) {
    const rows = [
        { label: 'Available', count: data.AVAILABLE, color: 'status-dot-success' },
        { label: 'Deployed', count: data.DEPLOYED, color: 'bg-[var(--color-accent-500)]' },
        { label: 'Maintenance', count: data.IN_MAINTENANCE, color: 'status-dot-warning' },
        { label: 'Retired', count: data.RETIRED, color: 'status-dot-muted' },
    ];

    return (
        <div className="card-flat">
            <SectionHeader title="Device Status" />
            <div className="space-y-2.5">
                {rows.map((r) => (
                    <div key={r.label} className="flex items-center gap-2">
                        <span className={`status-dot ${r.color}`} />
                        <span className="text-body-sm flex-1">{r.label}</span>
                        <span className="font-semibold text-[var(--color-text-primary)] text-sm tabular-nums">{r.count}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── REVENUE CARD ──────────────────────────────────────────────────────────────

export function RevenueCard({ data }: { data: DashboardStats['ordersAndRevenue'] }) {
    return (
        <div className="card-flat">
            <SectionHeader title="Revenue" />
            <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-[var(--color-surface-200)]">
                    <span className="text-body-sm">Total Revenue</span>
                    <span className="font-bold text-[var(--color-text-primary)]">
                        {fmtCurrency(data.totalRevenue)}
                    </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-[var(--color-surface-200)]">
                    <span className="text-body-sm">This Month</span>
                    <span className="font-semibold text-[var(--color-success-500)]">
                        {fmtCurrency(data.monthlyRevenue)}
                    </span>
                </div>
                <div className="flex justify-between items-center py-2">
                    <span className="text-body-sm">Total Orders</span>
                    <span className="font-semibold text-[var(--color-text-primary)]">{fmt(data.totalOrders)}</span>
                </div>
            </div>
        </div>
    );
}

// ─── FINES CARD ────────────────────────────────────────────────────────────────

export function FinesCard({ data }: { data: DashboardStats['fines'] }) {
    return (
        <div className="card-flat border-l-2 border-l-[var(--color-danger-400)]">
            <SectionHeader title="Fines & Penalties" />
            <p className="stat-value text-[var(--color-danger-500)]">{fmtCurrency(data.unpaidTotal)}</p>
            <p className="text-caption mt-1 mb-3">Outstanding balance</p>
            <div className="flex gap-4 text-sm">
                <span className="text-body-sm"><strong className="text-[var(--color-danger-500)]">{data.unpaidCount}</strong> unpaid</span>
                <span className="text-body-sm"><strong className="text-[var(--color-success-500)]">{data.paidCount}</strong> paid</span>
                <span className="text-body-sm"><strong className="text-[var(--color-text-muted)]">{data.waivedCount}</strong> waived</span>
            </div>
        </div>
    );
}

// ─── OVERDUE BORROWS TABLE ─────────────────────────────────────────────────────

export function OverdueBorrowsTable({ rows }: { rows: OverdueBorrow[] }) {
    if (rows.length === 0) {
        return (
            <div className="card-flat text-center py-10">
                <p className="text-body-sm text-[var(--color-success-500)] font-medium">✓ No overdue borrows</p>
            </div>
        );
    }

    return (
        <div className="table-wrap">
            <table className="table">
                <thead>
                    <tr>
                        <th>Device</th>
                        <th>Student</th>
                        <th>Due Date</th>
                        <th>Days Overdue</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((r) => (
                        <tr key={r.id}>
                            <td>
                                <p className="font-medium text-[var(--color-text-primary)]">{r.device.name}</p>
                                <p className="text-caption font-mono">{r.device.serialNumber}</p>
                            </td>
                            <td>
                                <p className="font-medium text-[var(--color-text-primary)]">
                                    {r.user.firstName} {r.user.lastName}
                                </p>
                                <p className="text-caption">{r.user.email}</p>
                            </td>
                            <td className="text-body-sm">{fmtDate(r.endDate)}</td>
                            <td>
                                <span className="badge badge-danger">{r.daysOverdue}d overdue</span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// ─── LOW STOCK TABLE ───────────────────────────────────────────────────────────

export function LowStockTable({ rows }: { rows: LowStockVariant[] }) {
    if (rows.length === 0) {
        return (
            <div className="card-flat text-center py-8">
                <p className="text-body-sm text-[var(--color-success-500)] font-medium">✓ All variants well stocked</p>
            </div>
        );
    }

    return (
        <div className="table-wrap">
            <table className="table">
                <thead>
                    <tr>
                        <th>Device</th>
                        <th>Variant</th>
                        <th>Stock</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((r) => (
                        <tr key={r.variantId}>
                            <td>
                                <p className="font-medium text-[var(--color-text-primary)]">{r.device.name}</p>
                                <p className="text-caption font-mono">{r.device.serialNumber}</p>
                            </td>
                            <td className="text-body-sm">{r.variantName}</td>
                            <td>
                                <span className={`badge ${r.stock === 0 ? 'badge-danger' : 'badge-warning'}`}>
                                    {r.stock === 0 ? 'Out of stock' : `${r.stock} left`}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// ─── RECENT ACTIVITY LOG ───────────────────────────────────────────────────────

const ACTION_COLOR: Record<string, string> = {
    CREATE: 'badge-success',
    UPDATE: 'badge-info',
    STATUS_CHANGE: 'badge-warning',
    BORROW: 'badge-brand',
    RETURN: 'badge-accent',
    DELETE: 'badge-danger',
};

export function ActivityLog({ logs }: { logs: RecentLog[] }) {
    return (
        <div className="space-y-0 divide-y divide-[var(--color-surface-200)]">
            {logs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 py-3">
                    <span className={`badge ${ACTION_COLOR[log.action] ?? 'badge-muted'} mt-0.5 flex-shrink-0`}>
                        {log.action.replace(/_/g, ' ')}
                    </span>
                    <div className="flex-1 min-w-0">
                        <p className="text-body-sm font-medium text-[var(--color-text-primary)] truncate">
                            {log.device.name}
                        </p>
                        {log.remarks && (
                            <p className="text-caption truncate">{log.remarks}</p>
                        )}
                    </div>
                    <div className="text-right flex-shrink-0">
                        <p className="text-caption">{fmtDate(log.performedAt)}</p>
                        <p className="text-caption">{fmtTime(log.performedAt)}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}

// ─── RECENT USERS ──────────────────────────────────────────────────────────────

export function RecentUsersTable({ users }: { users: RecentUser[] }) {
    return (
        <div className="space-y-0 divide-y divide-[var(--color-surface-200)]">
            {users.map((u) => {
                const initials = [u.firstName?.[0], u.lastName?.[0]].filter(Boolean).join('') || u.email[0].toUpperCase();
                return (
                    <div key={u.id} className="flex items-center gap-3 py-3">
                        <div className="avatar avatar-md flex-shrink-0">
                            <span>{initials}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-body-sm font-medium text-[var(--color-text-primary)] truncate">
                                {u.firstName} {u.lastName}
                            </p>
                            <p className="text-caption truncate">{u.email}</p>
                        </div>
                        <div className="text-right">
                            <StatusBadge status={u.role} />
                            <p className="text-caption mt-1">{fmtDate(u.createdAt)}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// ─── SPARKLINE TREND (SVG, no chart lib needed) ────────────────────────────────

export function TrendSparkline({
    data,
    color = 'var(--color-brand-500)',
    label,
}: {
    data: TrendPoint[];
    color?: string;
    label: string;
}) {
    if (!data.length) return null;

    const W = 200;
    const H = 48;
    const max = Math.max(...data.map((d) => d.count), 1);
    const points = data.map((d, i) => ({
        x: (i / (data.length - 1)) * W,
        y: H - (d.count / max) * (H - 8) - 4,
        count: d.count,
    }));

    const pathD = points
        .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
        .join(' ');

    const areaD = `${pathD} L ${W} ${H} L 0 ${H} Z`;

    return (
        <div>
            <div className="flex items-center justify-between mb-1">
                <span className="text-caption">{label}</span>
                <span className="text-caption font-semibold text-[var(--color-text-primary)]">
                    {data[data.length - 1]?.count ?? 0} today
                </span>
            </div>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-12 overflow-visible">
                <defs>
                    <linearGradient id={`grad-${label}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity="0.18" />
                        <stop offset="100%" stopColor={color} stopOpacity="0" />
                    </linearGradient>
                </defs>
                <path d={areaD} fill={`url(#grad-${label})`} />
                <path d={pathD} stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                {/* dots */}
                {points.map((p, i) => (
                    <circle key={i} cx={p.x} cy={p.y} r="2.5" fill={color} />
                ))}
            </svg>
            {/* date labels */}
            <div className="flex justify-between mt-1">
                <span className="text-caption">{data[0]?.date?.slice(5)}</span>
                <span className="text-caption">{data[data.length - 1]?.date?.slice(5)}</span>
            </div>
        </div>
    );
}

export function TrendsCard({ data }: { data: DashboardStats['trends'] }) {
    return (
        <div className="card-flat">
            <SectionHeader title="Last 7 Days" sub="Activity trends" />
            <div className="space-y-5">
                <TrendSparkline data={data.orders} label="Orders" color="var(--color-brand-500)" />
                <TrendSparkline data={data.borrowRequests} label="Borrow Requests" color="var(--color-accent-500)" />
            </div>
        </div>
    );
}

// ─── ICONS (inline SVG, no dependency) ────────────────────────────────────────

export function IconUsers() {
    return (
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    );
}

export function IconDevices() {
    return (
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <path d="M8 21h8M12 17v4" />
        </svg>
    );
}

export function IconValue() {
    return (
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
    );
}

export function IconBorrow() {
    return (
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
    );
}
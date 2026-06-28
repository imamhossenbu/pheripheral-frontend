import { fetchBorrows } from '@/lib/staff/borrow-api';
import { fetchFines, fetchReviews } from '@/lib/staff/misc-api';
import { fetchOrders } from '@/lib/staff/order-api';
import Link from 'next/link';

export default async function StaffDashboardPage() {
    // Fetch summary data in parallel
    const [orders, borrows, reviews, fines] = await Promise.all([
        fetchOrders({ page: 1, limit: 5, status: 'PENDING' }),
        fetchBorrows({ page: 1, limit: 5, status: 'PENDING' }),
        fetchReviews({ page: 1, limit: 5, status: 'PENDING' }),
        fetchFines({ page: 1, limit: 5, status: 'UNPAID' }),
    ]);

    const cards = [
        {
            tag: 'ORD-PND', label: 'Pending Orders',
            value: orders.meta.total, href: '/staff/orders?status=PENDING',
            dot: 'bg-warning-500', urgent: orders.meta.total > 0,
        },
        {
            tag: 'BRW-PND', label: 'Borrow Requests',
            value: borrows.meta.total, href: '/staff/borrow-requests?status=PENDING',
            dot: 'bg-warning-500', urgent: borrows.meta.total > 0,
        },
        {
            tag: 'REV-PND', label: 'Reviews to Moderate',
            value: reviews.meta.total, href: '/staff/reviews?status=PENDING',
            dot: 'bg-accent-500', urgent: false,
        },
        {
            tag: 'FIN-DUE', label: 'Unpaid Fines',
            value: fines.meta.total, href: '/staff/fines?status=UNPAID',
            dot: 'bg-danger-500', urgent: fines.meta.total > 0,
        },
    ];

    return (
        <>
            {/* Header Intro */}
            <div>
                <span className="text-xs font-bold uppercase tracking-widest text-brand-500 mb-1 block">
                    Staff Control Panel
                </span>
                <h1 className="text-3xl font-black text-text-primary tracking-tight">Dashboard Overview</h1>
                <p className="text-text-secondary mt-1 text-sm">Real-time breakdown of tasks requiring immediate operational review.</p>
            </div>

            {/* Action Required Banner */}
            {(orders.meta.total > 0 || borrows.meta.total > 0) && (
                <div className="p-4 bg-warning-50 border border-warning-400/30 rounded-2xl flex items-center justify-between shadow-sm animate-fade-in">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">⚠️</span>
                        <div>
                            <p className="font-bold text-text-primary text-sm">Action Required</p>
                            <p className="text-text-secondary text-xs mt-0.5 font-medium">
                                {[
                                    orders.meta.total > 0 && `${orders.meta.total} order${orders.meta.total > 1 ? 's' : ''} pending`,
                                    borrows.meta.total > 0 && `${borrows.meta.total} borrow request${borrows.meta.total > 1 ? 's' : ''} awaiting review`,
                                ].filter(Boolean).join(' · ')}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* KPI Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {cards.map((c) => (
                    <Link
                        key={c.tag}
                        href={c.href}
                        className="p-5 bg-surface-0 border border-surface-300 rounded-2xl shadow-sm hover:border-brand-300 hover:shadow-md transition-all flex flex-col justify-between group"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <span className="font-mono text-[10px] tracking-wider font-bold bg-surface-200 text-text-secondary px-2 py-0.5 rounded border border-surface-300">
                                {c.tag}
                            </span>
                            <span className={`w-2.5 h-2.5 rounded-full ${c.dot} ${c.urgent ? 'animate-pulse' : ''}`} />
                        </div>
                        <div>
                            <div className={`text-4xl font-black text-text-primary group-hover:text-brand-500 transition-colors ${c.urgent ? 'text-brand-500' : ''}`}>
                                {c.value}
                            </div>
                            <div className="text-xs font-semibold text-text-secondary mt-1.5">{c.label}</div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Recent Pending Orders Table */}
            {orders.data.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-text-primary">Incoming Pending Orders</h2>
                        <Link href="/staff/orders?status=PENDING" className="text-xs font-bold text-brand-500 hover:text-brand-600 hover:underline">
                            View all orders →
                        </Link>
                    </div>

                    <div className="bg-surface-0 border border-surface-300 rounded-2xl overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-surface-50 border-b border-surface-300 text-[11px] font-bold uppercase tracking-wider text-text-secondary font-mono">
                                        <th className="py-3 px-5">Order Reference</th>
                                        <th className="py-3 px-5">Customer / Identity</th>
                                        <th className="py-3 px-5">Total Valuation</th>
                                        <th className="py-3 px-5 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-surface-300">
                                    {orders.data.map((o) => {
                                        const name = [o.user.firstName, o.user.lastName].filter(Boolean).join(' ') || o.user.email;
                                        return (
                                            <tr key={o.id} className="hover:bg-surface-50/50 transition-colors">
                                                <td className="py-3.5 px-5 font-mono text-sm font-semibold text-text-primary">{o.orderNumber}</td>
                                                <td className="py-3.5 px-5 text-sm text-text-secondary">{name}</td>
                                                <td className="py-3.5 px-5 text-sm font-bold font-mono text-text-primary">
                                                    {new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT' }).format(Number(o.total))}
                                                </td>
                                                <td className="py-3.5 px-5 text-right">
                                                    <Link href={`/staff/orders?modal=${o.id}&status=PENDING`} className="inline-flex items-center justify-center px-4 py-1.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold shadow-sm transition-colors">
                                                        Review
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
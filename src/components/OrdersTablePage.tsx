'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { fetchAPI } from '@/lib/api';
import { CreditCard, FileText, Loader2, RefreshCw, Search } from 'lucide-react';
import toast from 'react-hot-toast';

type OrderStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'FULFILLED' | 'CANCELLED';
type PaymentStatus = 'UNPAID' | 'PARTIAL' | 'PAID' | 'REFUNDED';

interface OrderItem {
  id: string;
  quantity: number;
  total: string | number;
  device?: { name: string; brand: string; model: string };
}

interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  total: string | number;
  createdAt: string;
  user?: { email: string; firstName?: string | null; lastName?: string | null; department?: string | null };
  items: OrderItem[];
}

const orderStatuses: OrderStatus[] = ['PENDING', 'APPROVED', 'REJECTED', 'FULFILLED', 'CANCELLED'];
const paymentStatuses: PaymentStatus[] = ['UNPAID', 'PARTIAL', 'PAID', 'REFUNDED'];

export default function OrdersTablePage({ canManage = false, title = 'Orders' }: { canManage?: boolean; title?: string }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const query = useMemo(() => {
    const params = new URLSearchParams({ page: String(page), limit: '10' });
    if (status) params.set('status', status);
    if (paymentStatus) params.set('paymentStatus', paymentStatus);
    return params.toString();
  }, [page, status, paymentStatus]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetchAPI(`/orders?${query}`);
      setOrders(res.data || []);
      setTotalPages(res.meta?.totalPages || 1);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [query]);

  const updateOrder = async (id: string, body: Partial<Pick<Order, 'status' | 'paymentStatus'>>) => {
    setUpdatingId(id);
    try {
      const updated = await fetchAPI(`/orders/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
      setOrders(prev => prev.map(order => (order.id === id ? updated : order)));
      toast.success('Order updated');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update order.');
    } finally {
      setUpdatingId(null);
    }
  };

  const payWithSslCommerz = async (orderId: string) => {
    setUpdatingId(orderId);
    try {
      const session = await fetchAPI('/payments/sslcommerz/initiate', {
        method: 'POST',
        body: JSON.stringify({ orderId }),
      });
      window.location.href = session.paymentUrl;
    } catch (err: any) {
      toast.error(err.message || 'Failed to start SSLCommerz payment.');
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-dark dark:text-white tracking-tight">{title}</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Track requests, status changes, and SSLCommerz payment state.</p>
        </div>
        <button onClick={fetchOrders} className="inline-flex items-center gap-2 rounded-xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 px-4 py-2.5 text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-brand-blue">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="bg-white dark:bg-[#111827] border border-brand-pale dark:border-brand-dark/20 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input readOnly value="Use filters to narrow order status" className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-400 outline-none" />
        </div>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-3 py-2.5 text-xs outline-none">
          <option value="">All order status</option>
          {orderStatuses.map(item => <option key={item} value={item}>{item}</option>)}
        </select>
        <select value={paymentStatus} onChange={(e) => { setPaymentStatus(e.target.value); setPage(1); }} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-3 py-2.5 text-xs outline-none">
          <option value="">All payment status</option>
          {paymentStatuses.map(item => <option key={item} value={item}>{item}</option>)}
        </select>
      </div>

      <div className="bg-white dark:bg-[#111827] border border-brand-pale dark:border-brand-dark/20 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex flex-col justify-center items-center py-20 space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
            <span className="text-xs text-gray-400">Loading orders...</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-16 text-center text-gray-400">No orders found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-gray-100 dark:divide-gray-800">
              <thead>
                <tr className="text-gray-400 font-bold uppercase tracking-wider text-[10px] bg-gray-50 dark:bg-gray-900/10">
                  <th className="p-4">Order</th>
                  <th className="p-4">User</th>
                  <th className="p-4">Items</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-600 dark:text-gray-300">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20">
                    <td className="p-4">
                      <p className="font-extrabold text-brand-dark dark:text-white">{order.orderNumber}</p>
                      <p className="text-[10px] text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-gray-700 dark:text-gray-200">{order.user?.firstName || order.user?.lastName ? `${order.user?.firstName || ''} ${order.user?.lastName || ''}`.trim() : order.user?.email || 'Current user'}</p>
                      <p className="text-[10px] text-gray-400">{order.user?.department || order.user?.email || ''}</p>
                    </td>
                    <td className="p-4 min-w-48">
                      {order.items?.slice(0, 2).map((item) => (
                        <p key={item.id} className="truncate">{item.quantity}x {item.device?.name || 'Device'}</p>
                      ))}
                    </td>
                    <td className="p-4 font-bold text-brand-dark dark:text-white">${Number(order.total).toFixed(2)}</td>
                    <td className="p-4">
                      {canManage ? (
                        <select disabled={updatingId === order.id} value={order.status} onChange={(e) => updateOrder(order.id, { status: e.target.value as OrderStatus })} className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-2 py-1 text-[11px] font-semibold">
                          {orderStatuses.map(item => <option key={item} value={item}>{item}</option>)}
                        </select>
                      ) : (
                        <span className="rounded-full bg-brand-blue/10 px-2 py-1 text-[10px] font-bold text-brand-blue">{order.status}</span>
                      )}
                    </td>
                    <td className="p-4">
                      {canManage ? (
                        <select disabled={updatingId === order.id} value={order.paymentStatus} onChange={(e) => updateOrder(order.id, { paymentStatus: e.target.value as PaymentStatus })} className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-2 py-1 text-[11px] font-semibold">
                          {paymentStatuses.map(item => <option key={item} value={item}>{item}</option>)}
                        </select>
                      ) : (
                        <span className="rounded-full bg-gray-100 dark:bg-gray-800 px-2 py-1 text-[10px] font-bold text-gray-500">{order.paymentStatus}</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {order.paymentStatus !== 'PAID' ? (
                        <button onClick={() => payWithSslCommerz(order.id)} disabled={updatingId === order.id} className="inline-flex items-center gap-1.5 rounded-lg bg-brand-blue px-3 py-2 text-[11px] font-bold text-white disabled:opacity-60">
                          {updatingId === order.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CreditCard className="w-3.5 h-3.5" />}
                          Pay
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-green-600">
                          <FileText className="w-3.5 h-3.5" />
                          Settled
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-800">
            <span className="text-xs text-gray-400">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40">Previous</button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

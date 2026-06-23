'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { fetchAPI } from '@/lib/api';
import { CreditCard, Loader2, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'REFUNDED';

interface Payment {
  id: string;
  orderId: string;
  amount: string | number;
  method: string;
  status: PaymentStatus;
  transactionId?: string | null;
  provider?: string | null;
  paidAt?: string | null;
  createdAt: string;
  order?: { orderNumber: string; user?: { email: string } };
}

const statuses: PaymentStatus[] = ['PENDING', 'SUCCESS', 'FAILED', 'CANCELLED', 'REFUNDED'];

export default function PaymentsTablePage({ canManage = false, title = 'Payments' }: { canManage?: boolean; title?: string }) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const query = useMemo(() => {
    const params = new URLSearchParams({ page: String(page), limit: '10' });
    if (status) params.set('status', status);
    return params.toString();
  }, [page, status]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await fetchAPI(`/payments?${query}`);
      setPayments(res.data || []);
      setTotalPages(res.meta?.totalPages || 1);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load payments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [query]);

  const updatePayment = async (id: string, nextStatus: PaymentStatus) => {
    setUpdatingId(id);
    try {
      const updated = await fetchAPI(`/payments/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus }),
      });
      setPayments(prev => prev.map(payment => (payment.id === id ? updated : payment)));
      toast.success('Payment updated');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update payment.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-dark dark:text-white tracking-tight">{title}</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Review SSLCommerz transactions and manual payment records.</p>
        </div>
        <button onClick={fetchPayments} className="inline-flex items-center gap-2 rounded-xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 px-4 py-2.5 text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-brand-blue">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="bg-white dark:bg-[#111827] border border-brand-pale dark:border-brand-dark/20 rounded-2xl p-4 shadow-sm">
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="w-full md:w-56 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-3 py-2.5 text-xs outline-none">
          <option value="">All payment status</option>
          {statuses.map(item => <option key={item} value={item}>{item}</option>)}
        </select>
      </div>

      <div className="bg-white dark:bg-[#111827] border border-brand-pale dark:border-brand-dark/20 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex flex-col justify-center items-center py-20 space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
            <span className="text-xs text-gray-400">Loading payments...</span>
          </div>
        ) : payments.length === 0 ? (
          <div className="p-16 text-center text-gray-400">No payments found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-gray-100 dark:divide-gray-800">
              <thead>
                <tr className="text-gray-400 font-bold uppercase tracking-wider text-[10px] bg-gray-50 dark:bg-gray-900/10">
                  <th className="p-4">Payment</th>
                  <th className="p-4">Order</th>
                  <th className="p-4">Provider</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Paid At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-600 dark:text-gray-300">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-brand-blue" />
                        <div>
                          <p className="font-extrabold text-brand-dark dark:text-white">{payment.method}</p>
                          <p className="text-[10px] text-gray-400 font-mono">{payment.transactionId || payment.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-semibold">{payment.order?.orderNumber || payment.orderId}</p>
                      <p className="text-[10px] text-gray-400">{payment.order?.user?.email || ''}</p>
                    </td>
                    <td className="p-4">{payment.provider || 'SSLCOMMERZ'}</td>
                    <td className="p-4 font-bold text-brand-dark dark:text-white">${Number(payment.amount).toFixed(2)}</td>
                    <td className="p-4">
                      {canManage ? (
                        <select disabled={updatingId === payment.id} value={payment.status} onChange={(e) => updatePayment(payment.id, e.target.value as PaymentStatus)} className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-2 py-1 text-[11px] font-semibold">
                          {statuses.map(item => <option key={item} value={item}>{item}</option>)}
                        </select>
                      ) : (
                        <span className="rounded-full bg-gray-100 dark:bg-gray-800 px-2 py-1 text-[10px] font-bold text-gray-500">{payment.status}</span>
                      )}
                    </td>
                    <td className="p-4 text-gray-400">{payment.paidAt ? new Date(payment.paidAt).toLocaleString() : new Date(payment.createdAt).toLocaleDateString()}</td>
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

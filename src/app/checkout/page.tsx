'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { fetchAPI } from '@/lib/api';
import { CreditCard, Loader2, LockKeyhole, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const tax = subtotal * 0.0825;
  const total = subtotal + tax;

  const startPayment = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (items.length === 0) return;
    if (!user) {
      toast.error('Please sign in to place an order.');
      return;
    }

    const formData = new FormData(event.currentTarget);
    const notes = String(formData.get('notes') || '').trim();
    const orderPayload = {
      userId: user.id,
      items: items.map(item => ({
        deviceId: item.id,
        quantity: item.quantity,
        unitPrice: item.price,
      })),
      discount: 0,
      tax,
      notes: notes || undefined,
    };

    setLoading(true);
    try {
      const order = await fetchAPI('/orders', {
        method: 'POST',
        data: orderPayload,
      });

      const session = await fetchAPI('/payments/sslcommerz/initiate', {
        method: 'POST',
        data: { orderId: order.id },
      });

      clearCart();
      window.location.href = session.paymentUrl;
    } catch (err: any) {
      toast.error(err.message || 'Order or payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-pale/5 dark:bg-[#080d19]">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-extrabold text-brand-dark dark:text-white">Checkout</h1>
        <p className="text-sm text-gray-500 mt-1">Submit contact details and start payment for the selected devices.</p>

        {!user ? (
          <div className="mt-6 rounded-2xl border border-brand-pale dark:border-brand-dark/20 bg-white dark:bg-[#111827] p-12 text-center">
            <LockKeyhole className="w-10 h-10 text-brand-blue mx-auto mb-4" />
            <h2 className="text-lg font-extrabold text-brand-dark dark:text-white">Sign in required for checkout</h2>
            <p className="mt-2 text-sm text-gray-500">Devices can be viewed publicly, but orders and payments use your secured backend API.</p>
            <Link href="/login" className="mt-5 inline-flex rounded-xl bg-brand-blue px-5 py-3 text-sm font-bold text-white hover:bg-brand-dark">
              Sign In
            </Link>
          </div>
        ) : items.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-brand-pale dark:border-brand-dark/20 bg-white dark:bg-[#111827] p-12 text-center">
            <ShoppingCart className="w-10 h-10 text-gray-300 mx-auto mb-4" />
            <h2 className="text-lg font-extrabold text-brand-dark dark:text-white">No items to checkout</h2>
            <Link href="/devices" className="mt-5 inline-flex rounded-xl bg-brand-blue px-5 py-3 text-sm font-bold text-white hover:bg-brand-dark">
              Browse Devices
            </Link>
          </div>
        ) : (
          <form onSubmit={startPayment} className="mt-6 grid lg:grid-cols-[1fr_360px] gap-6">
            <section className="rounded-2xl border border-brand-pale dark:border-brand-dark/20 bg-white dark:bg-[#111827] p-6 space-y-5">
              <h2 className="text-base font-extrabold text-brand-dark dark:text-white">Billing Contact</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5">Full name</label>
                  <input required name="name" defaultValue={`${user.firstName || ''} ${user.lastName || ''}`.trim()} className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-blue" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5">Email</label>
                  <input required type="email" name="email" defaultValue={user.email} className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-blue" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5">Payment gateway</label>
                  <input readOnly value="SSLCommerz" className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-3 py-3 text-sm outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5">Department</label>
                  <input name="department" defaultValue={user.department || ''} className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-blue" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5">Order notes</label>
                <textarea name="notes" rows={4} placeholder="Delivery location, cost center, or approval notes..." className="w-full resize-none rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-blue" />
              </div>
              <div className="rounded-xl border border-brand-pale/70 dark:border-brand-dark/20 bg-brand-pale/10 dark:bg-gray-900/30 p-4 flex gap-3 text-xs text-gray-500 dark:text-gray-400">
                <LockKeyhole className="w-4 h-4 text-brand-blue shrink-0 mt-0.5" />
                <p>Checkout creates an order with <span className="font-mono">/orders</span>, then starts the secured SSLCommerz session with <span className="font-mono">/payments/sslcommerz/initiate</span>.</p>
              </div>
            </section>

            <aside className="rounded-2xl border border-brand-pale dark:border-brand-dark/20 bg-white dark:bg-[#111827] p-5 h-fit">
              <h2 className="text-base font-extrabold text-brand-dark dark:text-white">Payment Summary</h2>
              <div className="mt-4 space-y-3">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between gap-3 text-xs text-gray-500">
                    <span className="truncate">{item.quantity}x {item.name}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5 space-y-3 border-t border-gray-100 dark:border-gray-800 pt-4 text-sm">
                <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between text-gray-500"><span>Estimated tax</span><span>${tax.toFixed(2)}</span></div>
                <div className="flex justify-between text-base font-extrabold text-brand-dark dark:text-white"><span>Total</span><span>${total.toFixed(2)}</span></div>
              </div>
              <button disabled={loading} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-blue px-4 py-3 text-sm font-bold text-white hover:bg-brand-dark transition-colors disabled:opacity-60">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                Pay Now
              </button>
            </aside>
          </form>
        )}
      </main>
      <Footer />
    </div>
  );
}

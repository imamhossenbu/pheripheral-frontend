/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import Link from "next/link";

import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { fetchAPI } from "@/lib/api";
import {
  CreditCard,
  Loader2,
  LockKeyhole,
  ShoppingCart,
  ArrowLeft,
} from "lucide-react";
import toast from "react-hot-toast";

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
      toast.error("Please sign in to place an order.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const notes = String(formData.get("notes") || "").trim();
    const orderPayload = {
      userId: user.id,
      items: items.map((item) => ({
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
      const order = await fetchAPI("/orders", {
        method: "POST",
        data: orderPayload,
      });

      const session = await fetchAPI("/payments/sslcommerz/initiate", {
        method: "POST",
        data: { orderId: order.id },
      });

      clearCart();
      window.location.href = session.paymentUrl;
    } catch (err: any) {
      toast.error(err.message || "Order or payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 text-text-primary font-sans antialiased transition-colors duration-200">
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 pb-5 border-b border-surface-300">
          <div>
            <h1 className="text-3xl font-black text-text-primary tracking-tight uppercase">
              Secure Ledger Checkout
            </h1>
            <p className="text-xs font-semibold text-text-secondary mt-1">
              Verify billing authorization, input deployment logs, and route via
              secure payment gateway channels.
            </p>
          </div>
          <Link
            href="/cart"
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-surface-300 bg-surface-0 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-text-primary hover:bg-surface-100 hover:border-text-primary transition-all active:scale-98 shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-brand-500" /> Return To Cart
          </Link>
        </div>

        {!user ? (
          /* Sign In Needed State */
          <div className="rounded-xl border border-surface-300 bg-surface-0 p-16 text-center shadow-sm max-w-xl mx-auto mt-12">
            <div className="w-16 h-16 rounded-xl bg-danger-50 flex items-center justify-center mx-auto mb-5 border border-danger-100">
              <LockKeyhole className="w-6 h-6 text-danger-500" />
            </div>
            <h2 className="text-sm font-black text-text-primary uppercase tracking-widest">
              Authentication Token Required
            </h2>
            <p className="mt-2 text-xs font-semibold text-text-secondary max-w-sm mx-auto leading-relaxed">
              Public access allows hardware ledger observation only.
              Initializing secure pipeline request vectors requires active
              account verification.
            </p>
            <Link
              href="/login"
              className="mt-6 inline-flex items-center justify-center rounded-lg bg-brand-500 px-6 py-3 text-xs font-black uppercase tracking-wider text-surface-0 hover:bg-brand-600 transition-all active:scale-95 shadow-sm"
            >
              Sign In to Account
            </Link>
          </div>
        ) : items.length === 0 ? (
          /* Empty Items State */
          <div className="rounded-xl border border-surface-300 bg-surface-0 p-16 text-center shadow-sm max-w-xl mx-auto mt-12">
            <div className="w-16 h-16 rounded-xl bg-brand-50 flex items-center justify-center mx-auto mb-5 border border-brand-100">
              <ShoppingCart className="w-6 h-6 text-brand-500" />
            </div>
            <h2 className="text-sm font-black text-text-primary uppercase tracking-widest">
              No Assets Marked for Checkout
            </h2>
            <p className="mt-2 text-xs font-semibold text-text-secondary max-w-sm mx-auto leading-relaxed">
              Your equipment registry list is currently empty. Please assign
              target assets inside the ledger index before deploying.
            </p>
            <Link
              href="/devices"
              className="mt-6 inline-flex items-center justify-center rounded-lg bg-brand-500 px-6 py-3 text-xs font-black uppercase tracking-wider text-surface-0 hover:bg-brand-600 transition-all active:scale-95 shadow-sm"
            >
              Browse Asset Ledger
            </Link>
          </div>
        ) : (
          /* Active Form Layout */
          <form
            onSubmit={startPayment}
            className="grid lg:grid-cols-[1fr_380px] gap-8 items-start"
          >
            {/* Form Section */}
            <section className="rounded-xl border border-surface-300 bg-surface-0 p-6 space-y-6 shadow-sm">
              <h2 className="text-xs font-black text-text-primary uppercase tracking-wider border-b border-surface-100 pb-3">
                Authorized Billing & Operator Contacts
              </h2>

              <div className="grid md:grid-cols-2 gap-5">
                <div className="space-y-1">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-text-secondary">
                    Full Operator Name
                  </label>
                  <input
                    required
                    name="name"
                    defaultValue={`${user.firstName || ""} ${user.lastName || ""}`.trim()}
                    className="w-full text-xs p-3 rounded-lg border border-surface-300 bg-surface-50 text-text-primary outline-none focus:border-accent-500 transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-text-secondary">
                    Secure Communication Email
                  </label>
                  <input
                    required
                    type="email"
                    name="email"
                    defaultValue={user.email}
                    className="w-full text-xs p-3 rounded-lg border border-surface-300 bg-surface-50 text-text-primary outline-none focus:border-accent-500 transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-text-secondary">
                    Verified Gateway Routing
                  </label>
                  <input
                    readOnly
                    value="SSLCommerz Gateway"
                    className="w-full text-xs p-3 rounded-lg border border-surface-300 bg-surface-100 text-text-secondary font-semibold outline-none select-none cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-text-secondary">
                    Assigned Organizational Unit
                  </label>
                  <input
                    name="department"
                    defaultValue={user.department || ""}
                    className="w-full text-xs p-3 rounded-lg border border-surface-300 bg-surface-50 text-text-primary outline-none focus:border-accent-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase tracking-wider text-text-secondary">
                  Supplemental Order Log Notes
                </label>
                <textarea
                  name="notes"
                  rows={4}
                  placeholder="Specify particular deployment locations, internal cost centers, or structural validation keys..."
                  className="w-full text-xs p-3 resize-none rounded-lg border border-surface-300 bg-surface-50 text-text-primary outline-none focus:border-accent-500 transition-all"
                />
              </div>

              {/* Secure API Disclaimer */}
              <div className="rounded-lg border border-accent-300 bg-info-50 p-4 flex gap-3 text-xs text-accent-600 leading-relaxed font-medium">
                <LockKeyhole className="w-4 h-4 text-accent-500 shrink-0 mt-0.5" />
                <p>
                  Pipeline configuration: Instantiates core request node via
                  secure backend server hooks, mapping payload records to the
                  verified payment provider gateway endpoint.
                </p>
              </div>
            </section>

            {/* Sidebar Summary Section */}
            <aside className="rounded-xl border border-surface-300 bg-surface-0 p-6 shadow-sm sticky top-6">
              <h2 className="text-xs font-black text-text-primary uppercase tracking-wider border-b border-surface-200 pb-3">
                Allocation Ledger Receipt
              </h2>

              {/* Items Miniature Row Grid */}
              <div className="mt-4 space-y-3 max-h-40 overflow-y-auto pr-1 border-b border-surface-100 pb-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-start gap-3 text-xs font-semibold text-text-secondary"
                  >
                    <span className="truncate max-w-[200px]">
                      {item.quantity}x {item.name}
                    </span>
                    <span className="font-mono text-text-primary shrink-0">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Financial Calculation breakdown */}
              <div className="mt-4 space-y-3.5 text-xs font-semibold">
                <div className="flex justify-between text-text-secondary">
                  <span>Subtotal Assets</span>
                  <span className="font-mono text-text-primary">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-text-secondary">
                  <span>Estimated Tax Matrix (8.25%)</span>
                  <span className="font-mono text-text-primary">
                    ${tax.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-surface-200 pt-4 text-sm font-black text-text-primary">
                  <span className="uppercase tracking-wider">
                    Gross Aggregate Total
                  </span>
                  <span className="font-mono text-brand-500 text-base">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-3.5 text-xs font-black uppercase tracking-wider text-surface-0 hover:bg-brand-600 disabled:bg-surface-200 disabled:text-text-muted transition-all active:scale-99 shadow-sm cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CreditCard className="w-4 h-4" />
                )}
                Authorize Checkout Session
              </button>
            </aside>
          </form>
        )}
      </main>
    </div>
  );
}

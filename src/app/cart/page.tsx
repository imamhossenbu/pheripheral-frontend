"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { Minus, Plus, ShoppingCart, Trash2, ArrowLeft } from "lucide-react";

export default function CartPage() {
  const { items, subtotal, updateQuantity, removeItem } = useCart();
  const tax = subtotal * 0.0825;
  const total = subtotal + tax;

  return (
    <div className="min-h-screen bg-surface-50 text-text-primary font-sans antialiased transition-colors duration-200">
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 pb-5 border-b border-surface-300">
          <div>
            <h1 className="text-3xl font-black text-text-primary tracking-tight uppercase">
              Hardware Ledger Cart
            </h1>
            <p className="text-xs font-semibold text-text-secondary mt-1">
              Verify your selected equipment and reservation terms before
              initiating allocation logs.
            </p>
          </div>
          <Link
            href="/devices"
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-surface-300 bg-surface-0 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-text-primary hover:bg-surface-100 hover:border-text-primary transition-all active:scale-98 shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-brand-500" /> Continue
            Browsing
          </Link>
        </div>

        {items.length === 0 ? (
          /* Empty State — Paper Panel style */
          <div className="rounded-xl border border-surface-300 bg-surface-0 p-16 text-center shadow-sm max-w-xl mx-auto mt-12">
            <div className="w-16 h-16 rounded-xl bg-brand-50 flex items-center justify-center mx-auto mb-5 border border-brand-100">
              <ShoppingCart className="w-6 h-6 text-brand-500" />
            </div>
            <h2 className="text-sm font-black text-text-primary uppercase tracking-widest">
              Your cart is empty
            </h2>
            <p className="mt-2 text-xs font-semibold text-text-secondary max-w-sm mx-auto leading-relaxed">
              No peripheral assets currently indexed for provisioning. Browse
              devices to start a deployment record.
            </p>
            <Link
              href="/devices"
              className="mt-6 inline-flex items-center justify-center rounded-lg bg-brand-500 px-6 py-3 text-xs font-black uppercase tracking-wider text-surface-0 hover:bg-brand-600 transition-all active:scale-95 shadow-sm"
            >
              Explore Device Catalog
            </Link>
          </div>
        ) : (
          /* Active Cart Workspace */
          <div className="grid lg:grid-cols-[1fr_380px] gap-8 items-start">
            {/* Items Column */}
            <section className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-surface-300 bg-surface-0 p-4 flex gap-4 hover:shadow-sm hover:border-accent-400 transition-all duration-150"
                >
                  {/* Image Holder — Equipment Registry Style */}
                  <div className="w-24 h-24 rounded-lg bg-surface-50 border border-surface-200 overflow-hidden flex items-center justify-center shrink-0">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ShoppingCart className="w-6 h-6 text-text-muted stroke-[1.5]" />
                    )}
                  </div>

                  {/* Meta Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-wider text-accent-600 px-2 py-0.5 bg-info-50 rounded border border-info-400/20">
                        {item.brand}
                      </span>
                      <h2 className="font-black text-base text-text-primary truncate mt-1.5 tracking-tight leading-tight">
                        {item.name}
                      </h2>
                      <p className="text-xxs font-mono text-text-secondary mt-0.5">
                        Model / SKU: {item.model}
                      </p>
                    </div>
                    <p className="text-sm font-black text-text-primary font-mono tracking-tight">
                      $
                      {item.price.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>

                  {/* Controller Block */}
                  <div className="flex flex-col items-end justify-between shrink-0">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 rounded-lg text-danger-500 hover:bg-danger-50 active:scale-95 transition-all cursor-pointer"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {/* Quantity Selector matched with Surface Palette */}
                    <div className="flex items-center rounded-lg border border-surface-300 bg-surface-50 overflow-hidden p-0.5">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        className="p-1.5 rounded text-text-secondary hover:text-text-primary hover:bg-surface-0 transition-all shadow-xxs cursor-pointer"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-xs font-mono font-bold text-text-primary">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="p-1.5 rounded text-text-secondary hover:text-text-primary hover:bg-surface-0 transition-all shadow-xxs cursor-pointer"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </section>

            {/* Summary Aside — Ledger Receipt Style */}
            <aside className="rounded-xl border border-surface-300 bg-surface-0 p-6 shadow-sm sticky top-6">
              <h2 className="text-xs font-black text-text-primary uppercase tracking-wider border-b border-surface-200 pb-3">
                Order Specification Summary
              </h2>
              <div className="mt-5 space-y-3.5 text-xs font-semibold">
                <div className="flex justify-between text-text-secondary">
                  <span>Subtotal Matrix</span>
                  <span className="font-mono text-text-primary">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-text-secondary">
                  <span>Estimated Tax (8.25%)</span>
                  <span className="font-mono text-text-primary">
                    ${tax.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-surface-200 pt-4 text-sm font-black text-text-primary">
                  <span className="uppercase tracking-wider">Gross Total</span>
                  <span className="font-mono text-brand-500 text-base">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="mt-6 flex w-full items-center justify-center rounded-lg bg-brand-500 px-4 py-3.5 text-xs font-black uppercase tracking-wider text-surface-0 hover:bg-brand-600 transition-all active:scale-99 shadow-sm cursor-pointer"
              >
                Proceed to Checkout
              </Link>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}

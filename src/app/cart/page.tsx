"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";

export default function CartPage() {
  const { items, subtotal, updateQuantity, removeItem } = useCart();
  const tax = subtotal * 0.0825;
  const total = subtotal + tax;

  return (
    <div className="min-h-screen flex flex-col bg-brand-pale/5 dark:bg-[#080d19]">
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-brand-dark dark:text-white">
              Cart
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Review selected devices before checkout.
            </p>
          </div>
          <Link
            href="/devices"
            className="rounded-xl border border-brand-pale bg-white px-4 py-2 text-xs font-bold text-brand-dark hover:text-brand-blue dark:bg-[#111827] dark:text-white"
          >
            Add Devices
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-brand-pale dark:border-brand-dark/20 bg-white dark:bg-[#111827] p-12 text-center">
            <ShoppingCart className="w-10 h-10 text-gray-300 mx-auto mb-4" />
            <h2 className="text-lg font-extrabold text-brand-dark dark:text-white">
              Your cart is empty
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Browse devices and add items to start a checkout request.
            </p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1fr_360px] gap-6">
            <section className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-brand-pale dark:border-brand-dark/20 bg-white dark:bg-[#111827] p-4 flex gap-4"
                >
                  <div className="w-20 h-20 rounded-xl bg-gray-100 dark:bg-gray-800 overflow-hidden flex items-center justify-center shrink-0">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ShoppingCart className="w-6 h-6 text-gray-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-extrabold text-brand-dark dark:text-white truncate">
                      {item.name}
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">
                      {item.brand} · {item.model}
                    </p>
                    <p className="text-sm font-bold text-brand-dark dark:text-white mt-3">
                      $
                      {item.price.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="flex items-center rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        className="p-2 hover:bg-gray-50 dark:hover:bg-gray-800"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-9 text-center text-xs font-bold">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="p-2 hover:bg-gray-50 dark:hover:bg-gray-800"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </section>
            <aside className="rounded-2xl border border-brand-pale dark:border-brand-dark/20 bg-white dark:bg-[#111827] p-5 h-fit">
              <h2 className="text-base font-extrabold text-brand-dark dark:text-white">
                Order Summary
              </h2>
              <div className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Estimated tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-100 dark:border-gray-800 pt-3 text-base font-extrabold text-brand-dark dark:text-white">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
              <Link
                href="/checkout"
                className="mt-6 flex w-full items-center justify-center rounded-xl bg-brand-blue px-4 py-3 text-sm font-bold text-white hover:bg-brand-dark transition-colors"
              >
                Checkout
              </Link>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}

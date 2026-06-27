"use client";

import Link from "next/link";

import { XCircle } from "lucide-react";

export default function PaymentCancelledPage() {
  return (
    <div className="min-h-screen flex flex-col bg-brand-pale/5 dark:bg-[#080d19]">
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full rounded-2xl border border-brand-pale dark:border-brand-dark/20 bg-white dark:bg-[#111827] p-8 text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h1 className="mt-5 text-2xl font-extrabold text-brand-dark dark:text-white">
            Payment cancelled
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Your cart is still available if you want to try again.
          </p>
          <Link
            href="/checkout"
            className="mt-6 inline-flex rounded-xl bg-brand-blue px-5 py-3 text-sm font-bold text-white hover:bg-brand-dark"
          >
            Return to Checkout
          </Link>
        </div>
      </main>
    </div>
  );
}

"use client";

import Link from "next/link";

import { CheckCircle2 } from "lucide-react";

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen flex flex-col bg-brand-pale/5 dark:bg-[#080d19]">
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full rounded-2xl border border-brand-pale dark:border-brand-dark/20 bg-white dark:bg-[#111827] p-8 text-center">
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
          <h1 className="mt-5 text-2xl font-extrabold text-brand-dark dark:text-white">
            Payment successful
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Your device request has been submitted.
          </p>
          <Link
            href="/devices"
            className="mt-6 inline-flex rounded-xl bg-brand-blue px-5 py-3 text-sm font-bold text-white hover:bg-brand-dark"
          >
            Back to Devices
          </Link>
        </div>
      </main>
    </div>
  );
}

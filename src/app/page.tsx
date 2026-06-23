'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Cpu, ShieldCheck, ShoppingCart, Wrench, ArrowRight, BarChart3 } from 'lucide-react';

const highlights = [
  { icon: Cpu, label: 'Device catalog', value: 'Browse peripherals by category, status, and price.' },
  { icon: ShieldCheck, label: 'Asset control', value: 'Track warranty, serial numbers, and assignment history.' },
  { icon: ShoppingCart, label: 'Procurement cart', value: 'Collect requested devices and move them through checkout.' },
  { icon: BarChart3, label: 'Admin insights', value: 'Keep inventory and operations visible from one place.' },
];

const capabilities = [
  'Public device browsing for teams that need quick visibility before signing in.',
  'Detailed records with model, serial number, warranty, status, category, and specifications.',
  'Cart-based procurement so multiple devices can be reviewed before an order is created.',
  'Backend-backed order and payment records for teams with admin or editor permissions.',
  'Admin inventory tools for registering devices, uploading images, and maintaining category data.',
  'Notification-ready workflows for inventory alerts and operational follow-up.',
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-brand-pale/5 dark:bg-[#080d19]">
      <Navbar />
      <main className="flex-1">
        <section className="border-b border-brand-pale/70 dark:border-brand-dark/20 bg-white dark:bg-[#0b1220]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 grid lg:grid-cols-[1.05fr_0.95fr] gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-brand-pale bg-brand-pale/25 px-3 py-1 text-xs font-bold uppercase tracking-wide text-brand-dark dark:text-brand-light">
                <Wrench className="w-3.5 h-3.5" />
                Peripheral Management
              </div>
              <h1 className="mt-6 text-4xl sm:text-5xl font-extrabold tracking-tight text-brand-dark dark:text-white leading-tight">
                Periphex keeps every device visible from request to retirement.
              </h1>
              <p className="mt-5 max-w-2xl text-base text-gray-600 dark:text-gray-300 leading-7">
                Manage inventory, review device details, prepare carts for procurement, and keep teams aligned on the peripherals that power daily work.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/devices"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-blue px-5 py-3 text-sm font-bold text-white shadow-lg shadow-brand-blue/20 hover:bg-brand-dark transition-colors"
                >
                  Browse Devices
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/about"
                  className="inline-flex items-center justify-center rounded-xl border border-brand-pale bg-white px-5 py-3 text-sm font-bold text-brand-dark hover:border-brand-blue hover:text-brand-blue dark:bg-[#111827] dark:text-white transition-colors"
                >
                  About Periphex
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-brand-pale dark:border-brand-dark/30 bg-brand-pale/20 dark:bg-[#111827] p-5 shadow-xl shadow-brand-pale/20">
              <div className="grid grid-cols-2 gap-4">
                {highlights.map(item => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="rounded-xl border border-white/80 dark:border-gray-800 bg-white dark:bg-[#0b1220] p-5">
                      <Icon className="w-6 h-6 text-brand-blue mb-4" />
                      <h2 className="text-sm font-extrabold text-brand-dark dark:text-white">{item.label}</h2>
                      <p className="mt-2 text-xs leading-5 text-gray-500 dark:text-gray-400">{item.value}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-3 gap-5">
            {['Search inventory', 'Inspect device details', 'Checkout requests'].map((step, index) => (
              <div key={step} className="rounded-xl border border-brand-pale dark:border-brand-dark/20 bg-white dark:bg-[#111827] p-6">
                <span className="text-xs font-black text-brand-blue">0{index + 1}</span>
                <h3 className="mt-3 text-lg font-extrabold text-brand-dark dark:text-white">{step}</h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  {index === 0 && 'Use filters to find the exact peripheral or component your team needs.'}
                  {index === 1 && 'Review serial data, warranty windows, specs, and maintenance history.'}
                  {index === 2 && 'Send selected devices through a payment-ready checkout flow.'}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-y border-brand-pale/70 dark:border-brand-dark/20 bg-white dark:bg-[#0b1220]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid lg:grid-cols-[0.9fr_1.1fr] gap-10">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-brand-blue">What It Covers</p>
              <h2 className="mt-3 text-3xl font-extrabold text-brand-dark dark:text-white">
                A full path from discovery to purchase record.
              </h2>
              <p className="mt-4 text-sm leading-7 text-gray-600 dark:text-gray-300">
                Periphex is shaped around real IT desk work: people need to find hardware quickly, understand whether it is available, add the right items to a request, and leave a clean backend trail for operations.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {capabilities.map(capability => (
                <div key={capability} className="rounded-xl border border-brand-pale dark:border-brand-dark/20 bg-brand-pale/10 dark:bg-[#111827] p-4 text-sm leading-6 text-gray-600 dark:text-gray-300">
                  {capability}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="rounded-2xl border border-brand-pale dark:border-brand-dark/20 bg-white dark:bg-[#111827] p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h2 className="text-2xl font-extrabold text-brand-dark dark:text-white">Start with the device catalog.</h2>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Browsing does not require login. Sign in only when you are ready to create protected order and payment records.</p>
            </div>
            <Link href="/devices" className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-blue px-5 py-3 text-sm font-bold text-white hover:bg-brand-dark transition-colors">
              Open Devices
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

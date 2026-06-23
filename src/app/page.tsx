'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

import { Cpu, ShieldCheck, ShoppingCart, BarChart3, ArrowRight, Wrench } from 'lucide-react';
import FeaturesSection from '@/components/home/Featuressection';
import TestimonialsSection from '@/components/home/Testimonialssection';
import FAQSection from '@/components/home/Faqsection';
import CTASection from '@/components/home/Ctasection';

const highlights = [
  { icon: Cpu, label: 'Device catalog', value: 'Browse peripherals by category, status, and price.' },
  { icon: ShieldCheck, label: 'Asset control', value: 'Track warranty, serial numbers, and assignment history.' },
  { icon: ShoppingCart, label: 'Procurement cart', value: 'Collect requested devices and move them through checkout.' },
  { icon: BarChart3, label: 'Admin insights', value: 'Keep inventory and operations visible from one place.' },
];

const steps = [
  {
    label: 'Search inventory',
    desc: 'Use filters to find the exact peripheral or component your team needs.',
  },
  {
    label: 'Inspect device details',
    desc: 'Review serial data, warranty windows, specs, and current assignment status.',
  },
  {
    label: 'Checkout requests',
    desc: 'Send selected devices through a payment-ready checkout flow.',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-brand-pale/5 dark:bg-[#080d19]">
      <Navbar />

      <main className="flex-1">

        {/* ── HERO ── */}
        <section className="border-b border-brand-pale/70 dark:border-brand-dark/20 bg-white dark:bg-[#0b1220]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 grid lg:grid-cols-[1.05fr_0.95fr] gap-12 items-center">
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

        {/* ── HOW IT WORKS ── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="max-w-xl mb-10">
            <p className="text-xs font-black uppercase tracking-widest text-brand-blue mb-3">
              How it works
            </p>
            <h2 className="text-3xl font-extrabold text-brand-dark dark:text-white leading-snug">
              Three steps from browse to order.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {steps.map((step, index) => (
              <div
                key={step.label}
                className="rounded-xl border border-brand-pale dark:border-brand-dark/20 bg-white dark:bg-[#111827] p-6 flex flex-col gap-3"
              >
                <span className="w-8 h-8 rounded-lg bg-brand-blue/10 flex items-center justify-center text-xs font-black text-brand-blue">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="text-base font-extrabold text-brand-dark dark:text-white">{step.label}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-6">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── FEATURES ── */}
        <FeaturesSection />

        {/* ── TESTIMONIALS ── */}
        <TestimonialsSection />

        {/* ── FAQ ── */}
        <FAQSection />

        {/* ── CTA ── */}
        <CTASection />

      </main>

      <Footer />
    </div>
  );
}
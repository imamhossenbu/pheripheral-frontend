'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Boxes, ClipboardCheck, Shield, Users } from 'lucide-react';

const values = [
  { icon: Boxes, title: 'Centralized inventory', text: 'A single catalog for keyboards, monitors, components, adapters, and every tracked peripheral.' },
  { icon: ClipboardCheck, title: 'Operational clarity', text: 'Status, serial, warranty, and audit data stay close to the device record.' },
  { icon: Shield, title: 'Responsible access', text: 'Role-aware pages keep admin work separate from everyday browsing and requests.' },
  { icon: Users, title: 'Team requests', text: 'Cart and checkout flows help teams prepare procurement requests without losing context.' },
];

const workflow = [
  { title: 'Browse', text: 'Teams can explore the device catalog without signing in, making hardware availability easier to share.' },
  { title: 'Evaluate', text: 'Device detail pages collect the fields people usually ask for before requesting equipment.' },
  { title: 'Request', text: 'Cart and checkout pages translate selected devices into backend order and payment records.' },
  { title: 'Maintain', text: 'Admins can keep inventory, categories, users, logs, and notifications aligned over time.' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-brand-pale/5 dark:bg-[#080d19]">
      <Navbar />
      <main className="flex-1">
        <section className="bg-white dark:bg-[#0b1220] border-b border-brand-pale dark:border-brand-dark/20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
            <p className="text-xs font-black uppercase tracking-wider text-brand-blue">About Periphex</p>
            <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-brand-dark dark:text-white">
              Built for practical IT asset and peripheral management.
            </h1>
            <p className="mt-5 text-base leading-7 text-gray-600 dark:text-gray-300">
              Periphex helps teams keep device records, procurement requests, and lifecycle notes in one workflow. It is designed for IT teams that need fast lookup, clean controls, and enough detail to make confident decisions.
            </p>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {values.map(value => {
              const Icon = value.icon;
              return (
                <div key={value.title} className="rounded-xl border border-brand-pale dark:border-brand-dark/20 bg-white dark:bg-[#111827] p-6">
                  <Icon className="w-6 h-6 text-brand-blue" />
                  <h2 className="mt-5 text-base font-extrabold text-brand-dark dark:text-white">{value.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">{value.text}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="bg-white dark:bg-[#0b1220] border-y border-brand-pale dark:border-brand-dark/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="max-w-3xl">
              <p className="text-xs font-black uppercase tracking-wider text-brand-blue">Workflow</p>
              <h2 className="mt-3 text-3xl font-extrabold text-brand-dark dark:text-white">Designed around the asset lifecycle.</h2>
              <p className="mt-4 text-sm leading-7 text-gray-600 dark:text-gray-300">
                The application separates public discovery from secured operational actions. That keeps browsing lightweight while order creation, payment records, and admin changes remain protected by your backend roles.
              </p>
            </div>
            <div className="mt-8 grid md:grid-cols-4 gap-4">
              {workflow.map((item, index) => (
                <div key={item.title} className="rounded-xl border border-brand-pale dark:border-brand-dark/20 bg-brand-pale/10 dark:bg-[#111827] p-5">
                  <span className="text-xs font-black text-brand-blue">0{index + 1}</span>
                  <h3 className="mt-3 text-base font-extrabold text-brand-dark dark:text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-3xl font-extrabold text-brand-dark dark:text-white">Why this structure works</h2>
          <div className="mt-5 space-y-4 text-sm leading-7 text-gray-600 dark:text-gray-300">
            <p>
              Public catalog access removes friction for people who only need to inspect available peripherals. Protected checkout keeps the sensitive parts tied to authenticated users and your existing role guards.
            </p>
            <p>
              The order and payment flow follows the backend contract directly: an order is created with user and item data, then a payment transaction is attached to that order. This keeps frontend behavior predictable and backend records easy to audit.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

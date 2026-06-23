'use client';

import Link from 'next/link';
import { Bell, ClipboardList, CreditCard, Monitor } from 'lucide-react';

const actions = [
  { href: '/devices', label: 'Browse Devices', icon: Monitor, description: 'Find peripherals and add them to cart.' },
  { href: '/viewer/orders', label: 'My Orders', icon: ClipboardList, description: 'Track request and payment status.' },
  { href: '/viewer/payments', label: 'My Payments', icon: CreditCard, description: 'Review SSLCommerz transactions.' },
  { href: '/viewer/notifications', label: 'Notifications', icon: Bell, description: 'Read system updates and approvals.' },
];

export default function ViewerDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-brand-dark dark:text-white tracking-tight">Viewer Dashboard</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Your device requests, payments, and alerts in one place.</p>
      </div>
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {actions.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className="rounded-2xl border border-brand-pale dark:border-brand-dark/20 bg-white dark:bg-[#111827] p-5 shadow-sm hover:border-brand-blue/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center">
                <Icon className="w-5 h-5" />
              </div>
              <h2 className="mt-4 text-sm font-extrabold text-brand-dark dark:text-white">{item.label}</h2>
              <p className="mt-1 text-xs text-gray-500">{item.description}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

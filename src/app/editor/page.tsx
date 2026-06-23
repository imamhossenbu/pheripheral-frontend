'use client';

import Link from 'next/link';
import { Boxes, ClipboardList, CreditCard, FolderTree } from 'lucide-react';

const actions = [
  { href: '/editor/devices', label: 'Manage Devices', icon: Boxes, description: 'Create, update, and retire peripheral assets.' },
  { href: '/editor/categories', label: 'Manage Categories', icon: FolderTree, description: 'Keep the category tree organized.' },
  { href: '/editor/orders', label: 'Order Queue', icon: ClipboardList, description: 'Approve, fulfil, or adjust order statuses.' },
  { href: '/editor/payments', label: 'Payment Review', icon: CreditCard, description: 'Inspect SSLCommerz and manual payments.' },
];

export default function EditorDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-brand-dark dark:text-white tracking-tight">Editor Dashboard</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Operational workspace for inventory, order, and payment updates.</p>
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

'use client';

import { Search, ClipboardList, CreditCard, Bell, Package, Shield } from 'lucide-react';

const features = [
    {
        icon: Search,
        title: 'Browse without signing in',
        description:
            'Any team member can search the full device catalog, filter by category or status, and inspect specs before placing a request — no account needed.',
    },
    {
        icon: Package,
        title: 'Complete device records',
        description:
            'Every peripheral carries its model, brand, serial number, warranty window, category, and current status in one place. Nothing lives in a spreadsheet.',
    },
    {
        icon: ClipboardList,
        title: 'Cart-based procurement',
        description:
            'Add multiple devices, review the full list, and move to checkout in one flow. Orders are created from the cart so nothing gets lost between request and approval.',
    },
    {
        icon: CreditCard,
        title: 'Payment tracking',
        description:
            'Each order carries a payment record — partial, paid, or unpaid — so finance and IT can see the same picture without separate tools.',
    },
    {
        icon: Bell,
        title: 'Operational alerts',
        description:
            'Notifications surface inventory changes, order updates, and system events to the right people. No manual follow-up required.',
    },
    {
        icon: Shield,
        title: 'Role-based access',
        description:
            'Admins manage everything. Editors handle devices and orders. Viewers see their own data. Access is enforced at the API level, not just the UI.',
    },
];

export default function FeaturesSection() {
    return (
        <section className="border-y border-brand-pale/70 dark:border-brand-dark/20 bg-white dark:bg-[#0b1220]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

                {/* Header */}
                <div className="max-w-xl mb-12">
                    <p className="text-xs font-black uppercase tracking-widest text-brand-blue mb-3">
                        What Periphex does
                    </p>
                    <h2 className="text-3xl font-extrabold text-brand-dark dark:text-white leading-snug">
                        Every part of the peripheral lifecycle, in one system.
                    </h2>
                    <p className="mt-4 text-sm leading-7 text-gray-500 dark:text-gray-400">
                        From first search to final payment record — Periphex connects the steps that usually live across emails, sheets, and tickets.
                    </p>
                </div>

                {/* Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature) => {
                        const Icon = feature.icon;
                        return (
                            <div
                                key={feature.title}
                                className="group rounded-2xl border border-brand-pale dark:border-brand-dark/20 bg-brand-pale/5 dark:bg-[#111827] p-6 hover:border-brand-blue/30 dark:hover:border-brand-blue/20 transition-colors"
                            >
                                <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center mb-5">
                                    <Icon className="w-5 h-5 text-brand-blue" />
                                </div>
                                <h3 className="text-sm font-extrabold text-brand-dark dark:text-white mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-xs leading-6 text-gray-500 dark:text-gray-400">
                                    {feature.description}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
    {
        q: 'Do I need an account to browse devices?',
        a: 'No. The full device catalog is publicly accessible. You only need to sign in when you want to create an order, track a payment, or access role-specific management tools.',
    },
    {
        q: 'What is the difference between Admin, Editor, and Viewer roles?',
        a: 'Admins have full access — they can manage users, devices, orders, payments, and system settings. Editors can create and update device records and manage orders but cannot change user roles. Viewers can browse, add to cart, and track their own orders only.',
    },
    {
        q: 'How does the cart-to-order flow work?',
        a: 'You add devices to your cart while browsing, review the full list at checkout, and confirm the order. The system creates a backend order record with line items, totals, and a payment status that can be updated as payment is processed.',
    },
    {
        q: 'Can I track warranty and serial data for every device?',
        a: 'Yes. Each device record holds its serial number, warranty expiry, current status (available, assigned, under maintenance, retired), category, brand, model, and any additional specifications an admin has entered.',
    },
    {
        q: 'Is payment processing handled inside Periphex?',
        a: 'Periphex integrates with SSLCommerz for online payments. Orders can also be marked as paid manually by admins or editors — useful for offline procurement or bulk purchase scenarios.',
    },
    {
        q: 'How do notifications work?',
        a: 'Notifications are created automatically on key events — order status changes, payment updates, and inventory alerts. They appear in the bell menu and can be viewed in full on the notifications page.',
    },
];

export default function FAQSection() {
    const [open, setOpen] = useState<number | null>(null);

    return (
        <section className="border-t border-brand-pale/70 dark:border-brand-dark/20 bg-white dark:bg-[#0b1220]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="max-w-xl mb-12">
                    <p className="text-xs font-black uppercase tracking-widest text-brand-blue mb-3">
                        Common questions
                    </p>
                    <h2 className="text-3xl font-extrabold text-brand-dark dark:text-white leading-snug">
                        Things people ask before they start.
                    </h2>
                </div>

                <div className="max-w-3xl divide-y divide-brand-pale dark:divide-brand-dark/20">
                    {faqs.map((faq, i) => (
                        <div key={i}>
                            <button
                                onClick={() => setOpen(open === i ? null : i)}
                                className="w-full flex items-center justify-between gap-4 py-5 text-left group"
                            >
                                <span className="text-sm font-bold text-brand-dark dark:text-white group-hover:text-brand-blue transition-colors">
                                    {faq.q}
                                </span>
                                <ChevronDown
                                    className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${open === i ? 'rotate-180 text-brand-blue' : ''
                                        }`}
                                />
                            </button>

                            <div
                                className={`overflow-hidden transition-all duration-200 ${open === i ? 'max-h-48 pb-5' : 'max-h-0'
                                    }`}
                            >
                                <p className="text-sm leading-7 text-gray-500 dark:text-gray-400">
                                    {faq.a}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
'use client';

import { Quote } from 'lucide-react';

const testimonials = [
    {
        quote:
            'Before Periphex, peripheral requests went through email chains that nobody could track. Now every order has a record and a status — IT and finance look at the same data.',
        name: 'Rahel Tesfaye',
        title: 'IT Operations Lead',
        dept: 'Engineering',
        initials: 'RT',
    },
    {
        quote:
            'I can browse the full catalog without logging in, add what I need to the cart, and check out in a few minutes. The old process took days just to confirm availability.',
        name: 'Tariq Mahmood',
        title: 'Hardware Engineer',
        dept: 'Infrastructure',
        initials: 'TM',
    },
    {
        quote:
            'The role system is the feature I actually needed. Editors can update device records without touching anything they should not. No more shared admin passwords.',
        name: 'Priya Nair',
        title: 'Systems Administrator',
        dept: 'IT Security',
        initials: 'PN',
    },
];

export default function TestimonialsSection() {
    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

            <div className="max-w-xl mb-12">
                <p className="text-xs font-black uppercase tracking-widest text-brand-blue mb-3">
                    From the teams using it
                </p>
                <h2 className="text-3xl font-extrabold text-brand-dark dark:text-white leading-snug">
                    Real workflows, real feedback.
                </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {testimonials.map((t) => (
                    <div
                        key={t.name}
                        className="flex flex-col rounded-2xl border border-brand-pale dark:border-brand-dark/20 bg-white dark:bg-[#111827] p-6"
                    >
                        <Quote className="w-5 h-5 text-brand-blue/40 mb-4 shrink-0" />
                        <p className="text-sm leading-7 text-gray-600 dark:text-gray-300 flex-1">
                            {t.quote}
                        </p>
                        <div className="mt-6 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue text-xs font-extrabold shrink-0">
                                {t.initials}
                            </div>
                            <div>
                                <p className="text-xs font-bold text-brand-dark dark:text-white">{t.name}</p>
                                <p className="text-[10px] text-gray-400">{t.title} · {t.dept}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
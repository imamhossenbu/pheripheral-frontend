'use client';

import Link from 'next/link';
import { ArrowRight, LogIn } from 'lucide-react';

export default function CTASection() {
    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="rounded-2xl border border-brand-pale dark:border-brand-dark/20 bg-brand-blue px-8 py-12 sm:px-12 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">

                <div className="max-w-lg">
                    <p className="text-xs font-black uppercase tracking-widest text-white/60 mb-3">
                        Ready to start
                    </p>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-snug">
                        Your device catalog is waiting. No setup required.
                    </h2>
                    <p className="mt-3 text-sm leading-7 text-white/70">
                        Browse without an account. Sign in when you are ready to order. Admins can register devices and manage inventory from day one.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                    <Link
                        href="/devices"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-brand-blue hover:bg-brand-pale transition-colors"
                    >
                        Browse Devices
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                        href="/login"
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-bold text-white hover:bg-white/20 transition-colors"
                    >
                        <LogIn className="w-4 h-4" />
                        Sign In
                    </Link>
                </div>
            </div>
        </section>
    );
}
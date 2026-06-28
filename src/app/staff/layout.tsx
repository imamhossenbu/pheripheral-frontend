'use client'; 

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function StaffLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    const navLinks = [
        { href: '/staff/orders', label: 'Orders', icon: '📦' },
        { href: '/staff/borrow-requests', label: 'Borrow Requests', icon: '🔄' },
        { href: '/staff/reviews', label: 'Reviews', icon: '⭐' },
        { href: '/staff/fines', label: 'Fines', icon: '💰' },
    ];

    return (
        <div className="flex min-h-screen bg-surface-100 font-sans">

            {/* ─── SIDEBAR (LEFT) ─── */}
            <aside className="w-64 bg-surface-0 border-r border-surface-300 fixed h-full flex flex-col z-20">
                {/* Brand Logo Area */}
                <div className="h-16 flex items-center px-6 border-b border-surface-300 bg-surface-50">
                    <span className="w-2.5 h-2.5 rounded-sm bg-brand-500 mr-2 block animate-pulse" />
                    <span className="font-mono tracking-wider text-text-primary font-black uppercase text-lg">
                        PERIPHEX
                    </span>
                </div>

                {/* Sidebar Navigation Links */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    <div className="text-[10px] uppercase font-bold tracking-widest text-text-muted px-3 mb-2">
                        Core Navigation
                    </div>
                    {navLinks.map((n) => {
                        // চেক করা হচ্ছে বর্তমান পাথটি এই লিংকের পাথের সাথে মেলে কিনা (সাব-রাউটসহ ম্যাচ করবে)
                        const isActive = pathname.startsWith(n.href);

                        return (
                            <Link
                                key={n.href}
                                href={n.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-medium text-sm group ${isActive
                                        ? 'bg-brand-50 text-brand-600 font-bold' // অ্যাক্টিভ স্টেট স্টাইল
                                        : 'text-text-secondary hover:text-brand-600 hover:bg-brand-50/50' // ডিফল্ট বা ইন-অ্যাক্টিভ স্টাইল
                                    }`}
                            >
                                <span className={`text-xl transition-all ${isActive ? 'grayscale-0 scale-105' : 'filter grayscale group-hover:grayscale-0'
                                    }`}>
                                    {n.icon}
                                </span>
                                <span>{n.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Sidebar Footer */}
                <div className="p-4 border-t border-surface-300 bg-surface-50 text-xs text-text-muted font-mono text-center">
                    v4.0.0 — Light Ledger
                </div>
            </aside>

            {/* ─── MAIN CONTAINER (RIGHT) ─── */}
            <div className="flex-1 pl-64 flex flex-col min-h-screen">

                {/* ─── TOPBAR ─── */}
                <header className="h-16 bg-surface-0/80 backdrop-blur-md border-b border-surface-300 flex items-center justify-between px-8 sticky top-0 z-10">
                    <div className="text-sm font-medium text-text-secondary">
                        Welcome back, <span className="text-text-primary font-bold">Staff Member</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-success-50 text-success-500 px-3 py-1 rounded-full text-xs font-semibold border border-success-400/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-success-500 block" />
                            System Live
                        </div>
                    </div>
                </header>

                {/* ─── DYNAMIC PAGE CONTENT ─── */}
                <main className="p-8 flex-1 max-w-[1200px] w-full mx-auto space-y-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
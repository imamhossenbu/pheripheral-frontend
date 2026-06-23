'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth, User } from '@/context/AuthContext';
import {
  Loader2,
  Lock,
  Monitor,
  LogOut,
  User as UserIcon,
  ChevronDown,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type MenuItem = {
  name: string;
  href: string;
  icon: React.ElementType;
};

export default function DashboardShell({
  role,
  title,
  menuItems,
  children,
}: {
  role: User['role'];
  title: string;
  menuItems: MenuItem[];
  children: React.ReactNode;
}) {
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0e1a]">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-brand-blue mx-auto" />
          <p className="text-sm text-gray-500">Checking credentials...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0e1a] px-4">
        <div className="max-w-md w-full bg-white dark:bg-[#111827] border border-red-200 dark:border-red-950/20 p-8 rounded-2xl text-center shadow-xl space-y-4">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-xl flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Access Denied</h2>
          <p className="text-sm text-gray-500">
            You must be logged in as {title} to view this dashboard.
          </p>
          <Link href="/" className="inline-block text-xs font-bold text-brand-blue hover:underline">
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-brand-pale/5 dark:bg-[#080d19]">

      {/* ── SIDEBAR ── */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 bg-white dark:bg-[#111827] border-r border-brand-pale dark:border-brand-dark/20 min-h-screen sticky top-0">

        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-gray-100 dark:border-gray-800">
          <Link href="/" className="flex items-center space-x-2.5">
            <div className="w-8 h-8 bg-brand-blue rounded-lg flex items-center justify-center text-white shadow-md shadow-brand-blue/20">
              <Monitor className="w-4 h-4" />
            </div>
            <span className="text-lg font-extrabold tracking-tight text-brand-dark dark:text-white">
              Periphex
            </span>
          </Link>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <div className="px-3 py-2 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-800 mb-3">
            {title}
          </div>
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${isActive
                    ? 'bg-brand-blue text-white shadow-md shadow-brand-blue/10'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-brand-pale/20 dark:hover:bg-gray-800/40 hover:text-brand-dark dark:hover:text-white'
                  }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar bottom — user info */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={() => { logout(); router.push('/'); }}
            className="flex items-center space-x-2 w-full px-3 py-2 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-colors font-semibold"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN AREA ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Topbar */}
        <header className="h-16 bg-white dark:bg-[#111827] border-b border-brand-pale dark:border-brand-dark/20 flex items-center justify-between px-6 sticky top-0 z-30">

          {/* Mobile: logo */}
          <Link href="/" className="flex lg:hidden items-center space-x-2">
            <div className="w-8 h-8 bg-brand-blue rounded-lg flex items-center justify-center text-white">
              <Monitor className="w-4 h-4" />
            </div>
            <span className="text-base font-extrabold text-brand-dark dark:text-white">Periphex</span>
          </Link>

          {/* Page title (desktop) */}
          <span className="hidden lg:block text-sm font-bold text-gray-500 dark:text-gray-400">
            {title}
          </span>

          {/* Right — profile */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            >
              {user.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt={user.firstName || 'User'}
                  className="w-8 h-8 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
                />
              ) : (
                <div className="w-8 h-8 bg-brand-blue/10 rounded-lg flex items-center justify-center text-brand-blue font-bold text-sm">
                  {user.firstName ? user.firstName[0].toUpperCase() : 'U'}
                </div>
              )}
              <span className="hidden sm:block text-sm font-semibold text-gray-700 dark:text-gray-300">
                {user.firstName || 'User'}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            <AnimatePresence>
              {showProfileMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-52 bg-white dark:bg-[#111827] rounded-xl border border-brand-pale dark:border-brand-dark/30 shadow-2xl overflow-hidden z-50 p-2"
                >
                  <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800 mb-2">
                    <p className="text-xs text-gray-400">Signed in as</p>
                    <p className="text-sm font-bold text-brand-dark dark:text-white truncate">{user.email}</p>
                    <p className="text-xs text-gray-400 capitalize mt-0.5">{user.role.toLowerCase()}</p>
                  </div>

                  <Link
                    href="/"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <Monitor className="w-4 h-4" />
                    <span>Back to Site</span>
                  </Link>

                  <Link
                    href="/profile"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <UserIcon className="w-4 h-4" />
                    <span>My Profile</span>
                  </Link>

                  <button
                    onClick={() => { setShowProfileMenu(false); logout(); router.push('/'); }}
                    className="flex items-center space-x-2 w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
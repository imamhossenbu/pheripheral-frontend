'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { api } from '@/lib/api';
import {
  Bell, Menu, Monitor, ShoppingCart,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Notification {
  id: string;
  message: string;
  isRead: boolean;
  type: string;
  createdAt: string;
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const pathname = usePathname();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const { data } = await api.get<{ data: Notification[] }>('/notifications?limit=10');
      setNotifications(data.data);
      setUnreadCount(data.data.filter((n) => !n.isRead).length);
    } catch {
      // silent fail
    }
  };

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      // silent fail
    }
  };

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user]);

  // Click outside close
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const navItems = [
    { href: '/', label: 'Home', active: pathname === '/' },
    { href: '/about', label: 'About', active: pathname.startsWith('/about') },
    { href: '/devices', label: 'Devices', active: pathname.startsWith('/devices') },
    { href: '/contact', label: 'Contact', active: pathname.startsWith('/contact') },
  ];

  const dashboardLink =
    user?.role === 'ADMIN' ? '/admin'
      : user?.role === 'STAFF' ? '/staff'
        : '/student';

  const initials =
    [user?.firstName?.[0], user?.lastName?.[0]].filter(Boolean).join('') ||
    user?.email?.[0]?.toUpperCase() ||
    'U';

  const hideNavbar = pathname.includes("/admin") || pathname.includes("/student") || pathname.includes("/staff");

  if (hideNavbar) return null;



  return (
    <nav className="topbar">
      <div className="page-container flex items-center justify-between h-full w-full">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-8 h-8 rounded-[var(--radius-sm)] flex items-center justify-center text-white bg-[var(--color-brand-500)]">
            <Monitor className="w-5 h-5" />
          </div>
          <span className="font-extrabold tracking-tight text-[var(--color-text-primary)] text-xl">
            Periphex
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-4 py-2 text-sm font-medium rounded-[var(--radius-sm)] transition-colors ${item.active
                ? 'text-[var(--color-brand-600)] bg-[var(--color-brand-50)]'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-brand-600)]'
                }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">

          {/* Cart */}
          <Link href="/cart" className="btn btn-icon btn-sm relative">
            <ShoppingCart className="w-4 h-4" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--color-brand-500)] rounded-full text-[10px] text-white flex items-center justify-center font-bold">
                {itemCount}
              </span>
            )}
          </Link>

          {user ? (
            <>
              {/* Dashboard link */}
              <Link href={dashboardLink} className="hidden md:flex btn btn-ghost btn-sm">
                Dashboard
              </Link>

              {/* Notifications */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setShowNotifications((p) => !p)}
                  className="btn btn-icon btn-sm relative"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--color-danger-500)] rounded-full text-[10px] text-white flex items-center justify-center font-bold">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-80 bg-[var(--color-surface-0)] border border-[var(--color-surface-300)] shadow-[var(--shadow-modal)] rounded-[var(--radius-md)] z-50"
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-surface-200)]">
                        <span className="text-label">Notifications</span>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllRead}
                            className="text-xs text-[var(--color-brand-600)] hover:underline font-medium"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      {/* List */}
                      <div className="max-h-72 overflow-y-auto divide-y divide-[var(--color-surface-200)]">
                        {notifications.length === 0 ? (
                          <p className="text-body-sm text-center py-6 text-[var(--color-text-muted)]">
                            No notifications yet
                          </p>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              className={`px-4 py-3 text-sm ${!n.isRead ? 'bg-[var(--color-brand-50)]' : ''
                                }`}
                            >
                              <p className="text-[var(--color-text-primary)] font-medium leading-snug">
                                {n.message}
                              </p>
                              <p className="text-caption mt-0.5">
                                {new Date(n.createdAt).toLocaleDateString('en-US', {
                                  day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                                })}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Profile */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setShowProfileMenu((p) => !p)}
                  className="avatar avatar-sm cursor-pointer"
                >
                  {initials}
                </button>

                <AnimatePresence>
                  {showProfileMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 bg-[var(--color-surface-0)] border border-[var(--color-surface-300)] shadow-[var(--shadow-modal)] rounded-[var(--radius-md)] z-50 p-1.5"
                    >
                      {/* User info */}
                      <div className="px-3 py-2 mb-1 border-b border-[var(--color-surface-200)]">
                        <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-caption truncate">{user.email}</p>
                        <span className="badge badge-brand mt-1">{user.role}</span>
                      </div>

                      <Link
                        href="/profile"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm rounded-[var(--radius-sm)] hover:bg-[var(--color-surface-100)] text-[var(--color-text-secondary)] transition-colors"
                      >
                        My Profile
                      </Link>
                      <Link
                        href={dashboardLink}
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm rounded-[var(--radius-sm)] hover:bg-[var(--color-surface-100)] text-[var(--color-text-secondary)] transition-colors"
                      >
                        Dashboard
                      </Link>

                      <div className="border-t border-[var(--color-surface-200)] mt-1 pt-1">
                        <button
                          onClick={() => { setShowProfileMenu(false); logout(); }}
                          className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm rounded-[var(--radius-sm)] hover:bg-[var(--color-danger-50)] text-[var(--color-danger-500)] transition-colors"
                        >
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <Link href="/login" className="btn btn-primary btn-sm">
              Sign In
            </Link>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setShowMobileMenu((p) => !p)}
            className="md:hidden btn btn-icon btn-sm"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-[var(--color-surface-300)] bg-[var(--color-surface-0)] px-4 py-3 space-y-1"
          >
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setShowMobileMenu(false)}
                className={`block px-3 py-2 text-sm rounded-[var(--radius-sm)] font-medium ${item.active
                  ? 'text-[var(--color-brand-600)] bg-[var(--color-brand-50)]'
                  : 'text-[var(--color-text-secondary)]'
                  }`}
              >
                {item.label}
              </Link>
            ))}
            {user && (
              <Link
                href={dashboardLink}
                onClick={() => setShowMobileMenu(false)}
                className="block px-3 py-2 text-sm rounded-[var(--radius-sm)] font-medium text-[var(--color-text-secondary)]"
              >
                Dashboard
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { fetchAPI } from '@/lib/api';
import {
  Bell,
  Menu,
  X,
  LogOut,
  User as UserIcon,
  Sliders,
  Monitor,
  CheckCheck,
  Building,
  UserCheck,
  ShoppingCart,
  LayoutDashboard
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SystemNotification {
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

  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const data = await fetchAPI('/notifications?limit=5');
      setNotifications(data);
      const unreadData = await fetchAPI('/notifications?isRead=false');
      setUnreadCount(unreadData.length || 0);
    } catch (err) {
      console.error('Failed to load notifications', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllAsRead = async () => {
    try {
      await fetchAPI('/notifications/read-all', { method: 'PATCH' });
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark notifications read', err);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await fetchAPI(`/notifications/${id}/read`, { method: 'PATCH' });
      setUnreadCount(prev => Math.max(0, prev - 1));
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error('Failed to mark notification read', err);
    }
  };

  const navItems = [
    { href: '/', label: 'Home', active: pathname === '/' },
    { href: '/about', label: 'About', active: pathname.startsWith('/about') },
    { href: '/devices', label: 'Devices', active: pathname.startsWith('/devices') },
    { href: '/contact', label: 'Contact', active: pathname.startsWith('/contact') },
  ];

  const dashboardHref = user?.role === 'ADMIN' ? '/admin' : user?.role === 'EDITOR' ? '/editor' : '/viewer';
  const dashboardLabel = user?.role === 'ADMIN' ? 'Admin Panel' : user?.role === 'EDITOR' ? 'Editor Panel' : 'My Dashboard';

  return (
    <nav className="bg-white dark:bg-[#111827] border-b border-brand-pale dark:border-brand-dark/20 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">

          {/* Logo + Desktop Nav */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2.5">
              <div className="w-9 h-9 bg-brand-blue rounded-lg flex items-center justify-center text-white shadow-md shadow-brand-blue/20">
                <Monitor className="w-5 h-5" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-brand-dark dark:text-white">
                Periphex
              </span>
            </Link>

            <div className="hidden md:flex ml-10 space-x-8">
              {navItems.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-semibold transition-colors ${item.active
                      ? 'border-brand-blue text-brand-blue'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                    }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2">

            {/* Cart */}
            <Link
              href="/cart"
              className={`p-2 rounded-xl transition-colors relative ${pathname.startsWith('/cart') || pathname.startsWith('/checkout')
                  ? 'text-brand-blue bg-brand-blue/10'
                  : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              aria-label="Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute top-1 right-1 inline-flex min-w-4 h-4 items-center justify-center rounded-full bg-brand-blue px-1 text-[10px] font-bold text-white">
                  {itemCount}
                </span>
              )}
            </Link>

            {user ? (
              <>
                {/* Notification Bell */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => {
                      setShowNotifications(!showNotifications);
                      fetchNotifications();
                    }}
                    className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  <AnimatePresence>
                    {showNotifications && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#111827] rounded-xl border border-brand-pale dark:border-brand-dark/30 shadow-2xl overflow-hidden z-50"
                      >
                        <div className="p-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/20">
                          <span className="text-sm font-bold text-brand-dark dark:text-white">Notifications</span>
                          {unreadCount > 0 && (
                            <button
                              onClick={markAllAsRead}
                              className="text-xs font-semibold text-brand-blue hover:underline flex items-center space-x-1"
                            >
                              <CheckCheck className="w-3.5 h-3.5" />
                              <span>Mark all read</span>
                            </button>
                          )}
                        </div>

                        <div className="max-h-64 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
                          {notifications.length === 0 ? (
                            <div className="p-4 text-center text-xs text-gray-400 dark:text-gray-500">
                              No notifications to show.
                            </div>
                          ) : (
                            notifications.map((notif) => (
                              <div
                                key={notif.id}
                                onClick={() => !notif.isRead && markAsRead(notif.id)}
                                className={`p-3 text-xs cursor-pointer transition-colors ${notif.isRead
                                    ? 'bg-white dark:bg-[#111827] hover:bg-gray-50 dark:hover:bg-gray-800/40 text-gray-500 dark:text-gray-400'
                                    : 'bg-brand-pale/10 dark:bg-brand-blue/5 hover:bg-brand-pale/20 text-gray-900 dark:text-white font-medium'
                                  }`}
                              >
                                <div className="flex justify-between items-start">
                                  <p className="flex-1 pr-2">{notif.message}</p>
                                  {!notif.isRead && (
                                    <span className="w-2 h-2 rounded-full bg-brand-blue mt-1 shrink-0" />
                                  )}
                                </div>
                                <span className="text-[10px] text-gray-400 mt-1.5 block">
                                  {new Date(notif.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            ))
                          )}
                        </div>

                        <div className="p-2 border-t border-gray-100 dark:border-gray-800 text-center">
                          <Link
                            href="/notifications"
                            onClick={() => setShowNotifications(false)}
                            className="text-xs font-semibold text-brand-blue hover:underline"
                          >
                            View all alerts
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Profile Dropdown */}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center space-x-2 focus:outline-none p-1 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                  >
                    {user.imageUrl ? (
                      <img
                        src={user.imageUrl}
                        alt={user.firstName || 'User'}
                        className="w-8 h-8 rounded-lg object-cover border border-gray-200 dark:border-gray-800"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-brand-blue/10 rounded-lg flex items-center justify-center text-brand-blue font-bold text-sm">
                        {user.firstName ? user.firstName[0].toUpperCase() : 'U'}
                      </div>
                    )}
                    <span className="hidden sm:block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {user.firstName || 'User'}
                    </span>
                  </button>

                  <AnimatePresence>
                    {showProfileMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#111827] rounded-xl border border-brand-pale dark:border-brand-dark/30 shadow-2xl overflow-hidden z-50 p-2"
                      >
                        {/* User info */}
                        <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800 mb-2">
                          <p className="text-xs text-gray-400">Signed in as</p>
                          <p className="text-sm font-bold text-brand-dark dark:text-white truncate">{user.email}</p>
                          <div className="flex items-center text-[10px] text-gray-500 mt-1 space-x-1">
                            {user.role === 'ADMIN' && <Sliders className="w-3 h-3 text-brand-blue" />}
                            {user.role === 'EDITOR' && <UserCheck className="w-3 h-3 text-green-500" />}
                            {user.role === 'VIEWER' && <UserIcon className="w-3 h-3 text-gray-400" />}
                            <span className="capitalize">{user.role.toLowerCase()}</span>
                            {user.department && (
                              <>
                                <span>•</span>
                                <Building className="w-3 h-3" />
                                <span className="truncate max-w-[80px]">{user.department}</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Dashboard link — only in profile */}
                        <Link
                          href={dashboardHref}
                          onClick={() => setShowProfileMenu(false)}
                          className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 text-brand-blue" />
                          <span>{dashboardLabel}</span>
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
                          onClick={() => {
                            setShowProfileMenu(false);
                            logout();
                          }}
                          className="flex items-center space-x-2 w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <Link
                href="/login"
                className="hidden sm:inline-flex items-center rounded-xl bg-brand-blue px-4 py-2 text-xs font-bold text-white shadow-md shadow-brand-blue/15 hover:bg-brand-dark transition-colors"
              >
                Sign In
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-[#111827] overflow-hidden"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setShowMobileMenu(false)}
                  className={`block px-3 py-2.5 rounded-lg text-base font-semibold ${item.active
                      ? 'bg-brand-blue/10 text-brand-blue'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                >
                  {item.label}
                </Link>
              ))}

              {/* Dashboard in mobile menu too */}
              {user && (
                <Link
                  href={dashboardHref}
                  onClick={() => setShowMobileMenu(false)}
                  className={`flex items-center space-x-2 px-3 py-2.5 rounded-lg text-base font-semibold ${pathname.startsWith(dashboardHref)
                      ? 'bg-brand-blue/10 text-brand-blue'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>{dashboardLabel}</span>
                </Link>
              )}

              {!user && (
                <Link
                  href="/login"
                  onClick={() => setShowMobileMenu(false)}
                  className="block px-3 py-2.5 rounded-lg text-base font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Sign In
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
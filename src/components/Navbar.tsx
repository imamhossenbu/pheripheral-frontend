'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { fetchAPI } from '@/lib/api';
import {
  Bell, Menu, X, LogOut, User as UserIcon, Sliders, Monitor,
  CheckCheck, Building, UserCheck, ShoppingCart, LayoutDashboard
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const pathname = usePathname();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // ... (আপনার fetchNotifications logic একই থাকবে)

  const navItems = [
    { href: '/', label: 'Home', active: pathname === '/' },
    { href: '/about', label: 'About', active: pathname.startsWith('/about') },
    { href: '/devices', label: 'Devices', active: pathname.startsWith('/devices') },
    { href: '/contact', label: 'Contact', active: pathname.startsWith('/contact') },
  ];

  return (
    // ব্যবহার করা হয়েছে ডিজাইন সিস্টেমের .topbar ক্লাস
    <nav className="topbar">
      <div className="page-container flex items-center justify-between h-full">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-brand-500 rounded-md flex items-center justify-center text-white">
            <Monitor className="w-5 h-5" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-text-primary">Periphex</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map(item => (
            <Link key={item.href} href={item.href} className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-brand-600 transition-colors">
              {item.label}
            </Link>
          ))}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <Link href="/cart" className="btn btn-icon btn-sm relative">
            <ShoppingCart className="w-4 h-4" />
            {itemCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">{itemCount}</span>}
          </Link>

          {user ? (
            <div className="flex items-center gap-3">
              {/* Notification */}
              <div className="relative" ref={notifRef}>
                <button onClick={() => setShowNotifications(!showNotifications)} className="btn btn-icon btn-sm">
                  <Bell className="w-4 h-4" />
                </button>
                {/* Notification Dropdown (Using card style) */}
                <AnimatePresence>
                  {showNotifications && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-80 bg-card border border-default shadow-modal rounded-md z-50 p-4">
                      <h4 className="text-label mb-2">Notifications</h4>
                      <div className="space-y-2">
                        {/* Notification items */}
                        <p className="text-body-sm text-text-muted">No new notifications.</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Profile */}
              <div className="relative" ref={profileRef}>
                <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="avatar avatar-sm border-brand-200">
                  {user.firstName?.[0] || 'U'}
                </button>
                {/* Profile Dropdown */}
                <AnimatePresence>
                  {showProfileMenu && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-56 bg-card border border-default shadow-modal rounded-md z-50 p-2">
                      <Link href="/profile" className="block px-3 py-2 text-sm hover:bg-surface-50 rounded-sm">My Profile</Link>
                      <button onClick={logout} className="w-full text-left px-3 py-2 text-sm text-danger-500 hover:bg-danger-50 rounded-sm">Sign Out</button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ) : (
            <Link href="/login" className="btn btn-primary btn-sm">Sign In</Link>
          )}

          <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="md:hidden btn btn-icon btn-sm">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>
    </nav>
  );
}
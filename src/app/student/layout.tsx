/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  ClipboardList,
  PackageSearch,
  History,
  LogOut,
  Bell,
  Menu,
  X,
  User,
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", href: "/student", icon: LayoutDashboard },
  { name: "My Orders", href: "/student/orders", icon: ClipboardList },
  { name: "Borrow Requests", href: "/student/requests", icon: PackageSearch },
  { name: "History", href: "/student/history", icon: History },
  { name: "Profile", href: "/student/profile", icon: User },
];

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();

  const [, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const currentPage = menuItems.find((item) => pathname === item.href);

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const { data } = await api.get("/notifications/student?limit=10");
        setNotifications(data.data);
        setUnreadCount(data.data.filter((n: any) => !n.isRead).length);
      } catch {}
    };
    fetchNotifs();
  }, []);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node))
        setShowNotif(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node))
        setShowProfile(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const initials = useMemo(() => {
    if (!user) return "ST";
    return (
      [user.firstName?.[0], user.lastName?.[0]]
        .filter(Boolean)
        .join("")
        .toUpperCase() ||
      user.email?.[0].toUpperCase() ||
      "ST"
    );
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xs font-bold text-text-muted">
        LOADING...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50 flex">
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-surface-0 border-r border-surface-200 p-6 transform transition-transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static`}
      >
        <div className="flex items-center justify-between mb-10">
          <Link href={'/'}>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-brand-500 rounded flex items-center justify-center text-surface-0 font-black text-[10px]">
                P
              </div>
              <span className="text-brand-500 font-black text-xs tracking-[0.2em] uppercase">
                Periphex
              </span>
            </div>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
            <X className="w-4 h-4" />
          </button>
        </div>
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${isActive ? "bg-brand-50 text-brand-600 border border-brand-200" : "text-text-secondary hover:bg-surface-50 hover:text-text-primary"}`}
              >
                <Icon className="w-4 h-4" /> {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-surface-200 bg-surface-0 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div>
              <p className="text-[10px] text-text-muted uppercase hidden sm:block">
                Student Portal
              </p>
              <p className="font-semibold text-sm text-text-primary">
                {currentPage?.name ?? "Dashboard"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotif(!showNotif)}
                className="p-2 relative hover:bg-surface-100 rounded-lg"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-danger-500 rounded-full" />
                )}
              </button>
            </div>
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setShowProfile(!showProfile)}
                className="flex items-center gap-2 p-1 rounded-lg hover:bg-surface-100 transition-colors"
              >
                {user?.imageUrl ? (
                  <img
                    src={`${user.imageUrl}?t=${new Date().getTime()}`}
                    alt="Profile"
                    className="w-7 h-7 rounded-full object-cover border border-surface-200"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-brand-500 text-white flex items-center justify-center text-[10px] font-bold">
                    {initials}
                  </div>
                )}
              </button>
              <AnimatePresence>
                {showProfile && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute right-0 mt-2 w-56 bg-surface-0 border border-surface-200 shadow-lg rounded-lg p-1.5 z-50"
                  >
                    <div className="px-3 py-2 border-b border-surface-100 mb-1">
                      <p className="text-xs font-bold">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-[10px] text-text-muted">
                        {user?.email}
                      </p>
                    </div>
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-danger-500 hover:bg-danger-50 rounded"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>
        <main className="flex-1 p-8 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}

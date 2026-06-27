"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  Monitor,
  FolderTree,
  Users,
  History,
  Lock,
  Loader2,
  ClipboardList,
  CreditCard,
  PackageSearch,
  CalendarDays,
  Star,
  AlertCircle,
  Bell,
  LogOut,
  UserCircle,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";
import { api } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

// ─── MENU CONFIG ───────────────────────────────────────────────────────────────

const menuItems = [
  {
    section: "Overview",
    items: [{ name: "Dashboard", href: "/admin", icon: LayoutDashboard }],
  },
  {
    section: "Inventory",
    items: [
      { name: "Devices", href: "/admin/devices", icon: Monitor },
      { name: "Categories", href: "/admin/categories", icon: FolderTree },
    ],
  },
  {
    section: "Borrow System",
    items: [
      {
        name: "Borrow Requests",
        href: "/admin/borrow-requests",
        icon: PackageSearch,
      },
      { name: "Booking Calendar", href: "/admin/bookings", icon: CalendarDays },
      { name: "Fines & Penalties", href: "/admin/fines", icon: AlertCircle },
      { name: "Reviews", href: "/admin/reviews", icon: Star },
    ],
  },
  {
    section: "Commerce",
    items: [
      { name: "Orders", href: "/admin/orders", icon: ClipboardList },
      { name: "Payments", href: "/admin/payments", icon: CreditCard },
    ],
  },
  {
    section: "System",
    items: [
      { name: "Users", href: "/admin/users", icon: Users },
      { name: "Audit Logs", href: "/admin/logs", icon: History },
    ],
  },
];

// ─── NOTIFICATION TYPE ─────────────────────────────────────────────────────────

interface Notification {
  id: string;
  message: string;
  isRead: boolean;
  type: string;
  createdAt: string;
}

// ─── TOPBAR ────────────────────────────────────────────────────────────────────

function AdminTopbar({ onMenuToggle }: { onMenuToggle: () => void }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // current page title
  const currentPage = menuItems
    .flatMap((g) => g.items)
    .find((item) =>
      item.href === "/admin"
        ? pathname === "/admin"
        : pathname === item.href || pathname.startsWith(item.href + "/"),
    );

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get<{ data: Notification[] }>(
        "/notifications?limit=10",
      );
      setNotifications(data.data);
      setUnreadCount(data.data.filter((n) => !n.isRead).length);
    } catch {
      /* silent */
    }
  };

  const markAllRead = async () => {
    try {
      await api.patch("/notifications/read-all");
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      /* silent */
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // click outside close
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

  const initials =
    [user?.firstName?.[0], user?.lastName?.[0]].filter(Boolean).join("") ||
    user?.email?.[0]?.toUpperCase() ||
    "A";

  return (
    <header className="topbar justify-between px-4 lg:px-6">
      <div className="flex items-center gap-3">
        {/* Mobile sidebar toggle */}
        <button
          onClick={onMenuToggle}
          className="btn btn-icon btn-sm lg:hidden"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Current page breadcrumb */}
        <div>
          <p className="text-caption hidden sm:block">Admin Panel</p>
          <p className="font-semibold text-sm text-[var(--color-text-primary)]">
            {currentPage?.name ?? "Dashboard"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setShowNotif((p) => !p);
              setShowProfile(false);
            }}
            className="btn btn-icon btn-sm relative"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--color-danger-500)] rounded-full text-[10px] text-white flex items-center justify-center font-bold">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotif && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-80 bg-[var(--color-surface-0)] border border-[var(--color-surface-300)] shadow-[var(--shadow-modal)] rounded-[var(--radius-md)] z-50 overflow-hidden"
              >
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
                <div className="max-h-72 overflow-y-auto divide-y divide-[var(--color-surface-200)]">
                  {notifications.length === 0 ? (
                    <p className="text-body-sm text-center py-8 text-[var(--color-text-muted)]">
                      No notifications yet
                    </p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`px-4 py-3 ${!n.isRead ? "bg-[var(--color-brand-50)]" : ""}`}
                      >
                        <p className="text-sm text-[var(--color-text-primary)] font-medium leading-snug">
                          {n.message}
                        </p>
                        <p className="text-caption mt-0.5">
                          {new Date(n.createdAt).toLocaleDateString("en-US", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
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
            onClick={() => {
              setShowProfile((p) => !p);
              setShowNotif(false);
            }}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-[var(--radius-sm)] hover:bg-[var(--color-surface-100)] transition-colors"
          >
            <div className="avatar avatar-sm">{initials}</div>
            <span className="hidden sm:block text-sm font-medium text-[var(--color-text-primary)]">
              {user?.firstName ?? "Admin"}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
          </button>

          <AnimatePresence>
            {showProfile && (
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
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-caption truncate">{user?.email}</p>
                  <span className="badge badge-brand mt-1">ADMIN</span>
                </div>

                <Link
                  href="/admin/profile"
                  onClick={() => setShowProfile(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm rounded-[var(--radius-sm)] hover:bg-[var(--color-surface-100)] text-[var(--color-text-secondary)] transition-colors"
                >
                  <UserCircle className="w-4 h-4" />
                  My Profile
                </Link>

                <div className="border-t border-[var(--color-surface-200)] mt-1 pt-1">
                  <button
                    onClick={() => {
                      setShowProfile(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-[var(--radius-sm)] hover:bg-[var(--color-danger-50)] text-[var(--color-danger-500)] transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}

// ─── SIDEBAR ───────────────────────────────────────────────────────────────────

function AdminSidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar panel */}
      <aside
        className={`
          sidebar fixed lg:sticky top-0 z-40 h-dvh
          transition-transform duration-200
          ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Brand */}
        <div className="px-5 py-4 border-b border-[var(--color-surface-300)] flex items-center justify-between">
          <Link href={'/'}>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-[var(--radius-sm)] bg-[var(--color-brand-500)] flex items-center justify-center flex-shrink-0">
                <Monitor className="w-4 h-4 text-white" />
              </div>
              <span className="font-extrabold tracking-tight text-[var(--color-text-primary)]">
                Periphex
              </span>
            </div>
          </Link>
          {/* Close on mobile */}
          <button onClick={onClose} className="lg:hidden btn btn-icon btn-sm">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 overflow-y-auto">
          {menuItems.map((group) => (
            <div key={group.section} className="mb-1">
              <p className="sidebar-section-label">{group.section}</p>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname === item.href ||
                      pathname.startsWith(item.href + "/");

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`sidebar-link ${isActive ? "sidebar-link-active" : ""}`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-[var(--color-surface-300)]">
          <p className="text-caption">© Periphex Admin</p>
        </div>
      </aside>
    </>
  );
}

// ─── LAYOUT ────────────────────────────────────────────────────────────────────

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface-50)]">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--color-brand-500)] mx-auto" />
          <p className="text-body-sm">Checking credentials…</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface-50)] px-4">
        <div className="card card-lg max-w-sm w-full text-center space-y-4">
          <div className="w-12 h-12 rounded-[var(--radius-md)] bg-[var(--color-danger-50)] text-[var(--color-danger-500)] flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-heading-sm">Access Denied</h2>
            <p className="text-body-sm mt-1">
              Administrator access required to view this panel.
            </p>
          </div>
          <Link href="/" className="btn btn-primary btn-sm">
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-shell bg-[var(--color-surface-50)]">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="dashboard-main min-h-dvh">
        <AdminTopbar onMenuToggle={() => setSidebarOpen((p) => !p)} />
        <main className="dashboard-content">{children}</main>
      </div>
    </div>
  );
}

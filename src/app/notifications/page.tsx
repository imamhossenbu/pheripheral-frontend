"use client";

import React, { useState, useEffect } from "react";
import { fetchAPI } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import {
  Bell,
  Check,
  CheckCheck,
  Inbox,
  Loader2,
  AlertCircle,
  Info,
  AlertTriangle,
} from "lucide-react";
import toast from "react-hot-toast";

interface SystemNotification {
  id: string;
  message: string;
  isRead: boolean;
  type: string;
  createdAt: string;
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

  const fetchAllNotifications = async () => {
    if (!user) return;
    setLoading(true);
    try {
      let query = "";
      if (filter === "unread") query = "?isRead=false";
      if (filter === "read") query = "?isRead=true";

      const data = await fetchAPI(`/notifications${query}`);
      setNotifications(data);
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllNotifications();
  }, [user, filter]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await fetchAPI(`/notifications/${id}/read`, { method: "PATCH" });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
      toast.success("Notification marked as read");
    } catch (err: any) {
      toast.error(err.message || "Failed to update notification");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await fetchAPI("/notifications/read-all", { method: "PATCH" });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success("All notifications marked as read");
    } catch (err: any) {
      toast.error(err.message || "Failed to update notifications");
    }
  };

  const getIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case "WARNING":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case "ALERT":
      case "CRITICAL":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Info className="w-5 h-5 text-brand-blue" />;
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-brand-pale/5 dark:bg-[#080d19]">
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-brand-dark dark:text-white tracking-tight flex items-center space-x-3">
              <Bell className="w-8 h-8 text-brand-blue" />
              <span>Notifications Feed</span>
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5">
              Review history logs and alerts targeted directly to your account.
            </p>
          </div>

          <div className="flex space-x-3 shrink-0">
            {notifications.some((n) => !n.isRead) && (
              <button
                onClick={handleMarkAllRead}
                className="inline-flex items-center space-x-2 bg-brand-blue/10 dark:bg-brand-blue/20 hover:bg-brand-blue/20 text-brand-blue text-xs font-bold py-2.5 px-4 rounded-xl transition-all"
              >
                <CheckCheck className="w-4 h-4" />
                <span>Mark All Read</span>
              </button>
            )}
          </div>
        </div>

        {/* Filters Tab */}
        <div className="flex border-b border-gray-200 dark:border-gray-800 mb-6">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
              filter === "all"
                ? "border-brand-blue text-brand-blue"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            All Alerts
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
              filter === "unread"
                ? "border-brand-blue text-brand-blue"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            Unread
          </button>
          <button
            onClick={() => setFilter("read")}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
              filter === "read"
                ? "border-brand-blue text-brand-blue"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            Read History
          </button>
        </div>

        {/* Notifications List */}
        <div className="bg-white dark:bg-[#111827] border border-brand-pale dark:border-brand-dark/20 rounded-2xl overflow-hidden shadow-xl shadow-brand-pale/5">
          {loading ? (
            <div className="flex flex-col justify-center items-center py-16 space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
              <span className="text-sm text-gray-400">
                Loading your notifications...
              </span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-500 space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800/40 rounded-full">
                <Inbox className="w-10 h-10" />
              </div>
              <p className="text-sm font-semibold">Your inbox is clear</p>
              <p className="text-xs text-gray-500 max-w-xs text-center">
                No matching alerts were discovered under this filter.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {notifications.map((notif, index) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={notif.id}
                  className={`p-5 flex items-start space-x-4 transition-colors ${
                    notif.isRead
                      ? "bg-white dark:bg-[#111827]"
                      : "bg-brand-pale/10 dark:bg-brand-blue/5"
                  }`}
                >
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-xl shrink-0 mt-0.5">
                    {getIcon(notif.type)}
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-start space-x-2">
                      <p
                        className={`text-sm ${
                          notif.isRead
                            ? "text-gray-600 dark:text-gray-300"
                            : "text-gray-900 dark:text-white font-semibold"
                        }`}
                      >
                        {notif.message}
                      </p>

                      {!notif.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(notif.id)}
                          className="p-1 rounded-lg hover:bg-brand-blue/10 text-brand-blue shrink-0 transition-colors"
                          title="Mark as read"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center text-xxs text-gray-400 space-x-2">
                      <span className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-xxs tracking-wider font-bold text-gray-500">
                        {notif.type.toUpperCase()}
                      </span>
                      <span>•</span>
                      <span>{new Date(notif.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

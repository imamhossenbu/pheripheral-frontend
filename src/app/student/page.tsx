"use client";

import { motion } from "framer-motion";
import {
  Package,
  Clock,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default function StudentOverviewPage() {
  const stats = [
    {
      label: "Active Orders",
      value: "03",
      icon: Package,
      color: "text-brand-500",
    },
    {
      label: "Pending Requests",
      value: "01",
      icon: Clock,
      color: "text-accent-500",
    },
    {
      label: "Approved Items",
      value: "12",
      icon: CheckCircle2,
      color: "text-success-500",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-black text-text-primary uppercase tracking-tight">
          Dashboard Overview
        </h1>
        <p className="text-xs font-semibold text-text-secondary">
          Welcome back to your asset registry hub.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-surface-0 p-6 rounded-xl border border-surface-200 shadow-sm flex items-center justify-between"
          >
            <div>
              <p className="text-[10px] font-black text-text-muted uppercase tracking-wider">
                {stat.label}
              </p>
              <p className="text-2xl font-black text-text-primary mt-1">
                {stat.value}
              </p>
            </div>
            <div className={`p-3 bg-surface-50 rounded-lg ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Activity Log */}
        <div className="lg:col-span-2 bg-surface-0 border border-surface-200 rounded-xl shadow-sm p-6">
          <h2 className="text-xs font-black text-text-primary uppercase tracking-wider mb-6">
            Recent Activity Logs
          </h2>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center text-brand-500 shrink-0">
                <Package className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-text-primary">
                  Order #ORD-9921 placed
                </p>
                <p className="text-[10px] font-semibold text-text-muted">
                  Jun 27, 2026 - 02:45 PM
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-success-50 flex items-center justify-center text-success-500 shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-text-primary">
                  Asset MacBook Pro approved
                </p>
                <p className="text-[10px] font-semibold text-text-muted">
                  Jun 25, 2026 - 10:15 AM
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions / Alerts */}
        <div className="bg-surface-0 border border-surface-200 rounded-xl shadow-sm p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-xs font-black text-text-primary uppercase tracking-wider mb-4">
              Important Notices
            </h2>
            <div className="p-4 bg-info-50 border border-info-200 rounded-lg flex gap-3">
              <AlertCircle className="w-4 h-4 text-info-500 shrink-0" />
              <p className="text-[10px] font-semibold text-info-700 leading-relaxed">
                Inventory audit scheduled for July 1st. Ensure all borrowed
                peripherals are updated in the system.
              </p>
            </div>
          </div>
          <Link
            href="/student/requests"
            className="mt-6 flex items-center justify-center gap-2 w-full py-3 bg-brand-500 text-surface-0 text-[10px] font-black uppercase rounded-lg hover:bg-brand-600 transition-all"
          >
            Initiate New Request <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

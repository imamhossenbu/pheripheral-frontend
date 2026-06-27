"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { motion } from "framer-motion";
import { Package, Clock, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface Order {
  id: string;
  item: { name: string };
  status: "PENDING" | "APPROVED" | "REJECTED" | "RETURNED";
  createdAt: string;
}

export default function StudentOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get("/orders/my-orders");
        setOrders(data);
      } catch (err: any) {
        toast.error("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "APPROVED":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "REJECTED":
        return "bg-danger-100 text-danger-700 border-danger-200";
      default:
        return "bg-surface-100 text-text-muted border-surface-200";
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-black text-text-primary uppercase mb-6">
          My Orders
        </h1>

        {loading ? (
          <div className="flex justify-center p-20">
            <Loader2 className="animate-spin w-8 h-8 text-brand-500" />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-surface-0 rounded-xl border border-surface-200 overflow-hidden"
          >
            <table className="w-full text-left">
              <thead className="bg-surface-50 border-b border-surface-200 text-xs font-black uppercase text-text-muted">
                <tr>
                  <th className="px-6 py-4">Item</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-surface-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-semibold text-text-primary">
                      {order.item.name}
                    </td>
                    <td className="px-6 py-4 text-xs text-text-muted">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-md text-[10px] font-black uppercase border ${getStatusStyle(order.status)}`}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {orders.length === 0 && (
              <div className="p-20 text-center text-text-muted text-xs font-semibold">
                No orders found.
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

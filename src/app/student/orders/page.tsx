"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { motion } from "framer-motion";
import { Loader2, FileText, Receipt, Package } from "lucide-react";
import toast from "react-hot-toast";

export default function StudentOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get("/orders");
        // যদি রেসপন্স `{ data: [...] }` ফরম্যাটে হয় তবে data.data নিন, অন্যথায় data
        setOrders(Array.isArray(data) ? data : data.data || []);
      } catch (err: any) {
        toast.error("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="p-8 bg-surface-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-black text-text-primary uppercase mb-8">
          My Orders
        </h1>

        {loading ? (
          <div className="flex justify-center p-20">
            <Loader2 className="animate-spin w-8 h-8 text-brand-500" />
          </div>
        ) : (
          <div className="grid gap-4">
            {orders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-surface-0 p-6 rounded-xl border border-surface-200 flex items-center justify-between hover:border-brand-500 transition-colors shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-brand-50 rounded-lg">
                    <Package className="w-6 h-6 text-brand-500" />
                  </div>
                  <div>
                    <h3 className="font-black text-text-primary">
                      Order #{order.id.slice(-6).toUpperCase()}
                    </h3>
                    <p className="text-xs text-text-muted">
                      Placed on {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase text-text-muted">
                      Total Amount
                    </p>
                    <p className="font-bold text-text-primary">
                      ${order.invoice?.total || "0.00"}
                    </p>
                  </div>

                  <div>
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {order.invoice?.status || "PENDING"}
                    </span>
                  </div>

                  <button className="p-2 hover:bg-surface-100 rounded-lg transition-colors">
                    <Receipt className="w-5 h-5 text-text-secondary" />
                  </button>
                </div>
              </motion.div>
            ))}

            {orders.length === 0 && (
              <div className="text-center py-20 text-text-muted">
                No orders found.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

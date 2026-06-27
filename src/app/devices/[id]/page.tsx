"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { fetchAPI } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import {
  ArrowLeft,
  Calendar,
  History,
  Loader2,
  ShoppingCart,
  SlidersHorizontal,
  Tag,
  Wrench,
} from "lucide-react";
import toast from "react-hot-toast";

interface Device {
  id: string;
  name: string;
  brand: string;
  model: string;
  serialNumber: string;
  price: string;
  status: string;
  description: string;
  specifications: Record<string, unknown>;
  workingPrinciple: string;
  purchaseDate: string;
  warrantyExpiry: string;
  category?: { id: string; name: string };
  imageUrl?: string;
}

interface InventoryLog {
  id: string;
  action: string;
  remarks: string | null;
  performedAt: string;
}

export default function DeviceDetailsPage() {
  const params = useParams<{ id: string }>();
  const { addItem } = useCart();
  const [device, setDevice] = useState<Device | null>(null);
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDevice = async () => {
      setLoading(true);
      try {
        const [deviceData, logData] = await Promise.all([
          fetchAPI(`/devices/${params.id}`),
          fetchAPI(`/inventory-logs?deviceId=${params.id}&limit=100`).catch(
            () => [],
          ),
        ]);
        setDevice(deviceData);
        setLogs(logData.data || logData || []);
      } catch (err: any) {
        toast.error(err.message || "Failed to load device details");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) loadDevice();
  }, [params.id]);

  const addDeviceToCart = () => {
    if (!device) return;
    addItem({
      id: device.id,
      name: device.name,
      brand: device.brand,
      model: device.model,
      price: Number(device.price),
      imageUrl: device.imageUrl,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-pale/5 dark:bg-[#080d19]">
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/devices"
          className="inline-flex items-center gap-2 text-xs font-bold text-brand-blue hover:underline mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Devices
        </Link>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
          </div>
        ) : !device ? (
          <div className="rounded-2xl border border-brand-pale dark:border-brand-dark/20 bg-white dark:bg-[#111827] p-12 text-center text-gray-500">
            Device not found.
          </div>
        ) : (
          <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-8">
            <section className="space-y-5">
              <div className="rounded-2xl border border-brand-pale dark:border-brand-dark/20 bg-white dark:bg-[#111827] overflow-hidden">
                <div className="aspect-video bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  {device.imageUrl ? (
                    <img
                      src={device.imageUrl}
                      alt={device.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Tag className="w-12 h-12 text-gray-300" />
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-black uppercase tracking-wider text-brand-blue">
                      {device.brand}
                    </span>
                    <span className="rounded-full bg-brand-blue/10 px-3 py-1 text-[10px] font-black text-brand-blue">
                      {device.status.replace("_", " ")}
                    </span>
                  </div>
                  <h1 className="mt-3 text-3xl font-extrabold text-brand-dark dark:text-white">
                    {device.name}
                  </h1>
                  <p className="mt-2 text-sm text-gray-500">
                    {device.model} · {device.serialNumber}
                  </p>
                  <button
                    onClick={addDeviceToCart}
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-blue px-5 py-3 text-sm font-bold text-white hover:bg-brand-dark transition-colors"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Add to Cart
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-brand-pale dark:border-brand-dark/20 bg-white dark:bg-[#111827] p-5">
                <h2 className="text-base font-extrabold text-brand-dark dark:text-white">
                  Lifecycle
                </h2>
                <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> Purchase
                    </p>
                    <p className="mt-1 text-brand-dark dark:text-white font-bold">
                      {new Date(device.purchaseDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
                      <Wrench className="w-3.5 h-3.5" /> Warranty
                    </p>
                    <p className="mt-1 text-brand-dark dark:text-white font-bold">
                      {new Date(device.warrantyExpiry).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-5">
              <div className="rounded-2xl border border-brand-pale dark:border-brand-dark/20 bg-white dark:bg-[#111827] p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                      Price
                    </p>
                    <p className="mt-1 text-2xl font-extrabold text-brand-dark dark:text-white">
                      $
                      {Number(device.price).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                  <span className="rounded-lg bg-brand-pale/30 px-3 py-1 text-xs font-bold text-brand-dark dark:text-brand-light">
                    {device.category?.name || "Uncategorized"}
                  </span>
                </div>
                <p className="mt-5 text-sm leading-7 text-gray-600 dark:text-gray-300">
                  {device.description}
                </p>
              </div>

              <div className="rounded-2xl border border-brand-pale dark:border-brand-dark/20 bg-white dark:bg-[#111827] p-6">
                <h2 className="text-base font-extrabold text-brand-dark dark:text-white flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-brand-blue" />
                  Specifications
                </h2>
                <div className="mt-4 divide-y divide-gray-100 dark:divide-gray-800">
                  {device.specifications &&
                  Object.keys(device.specifications).length > 0 ? (
                    Object.entries(device.specifications).map(
                      ([key, value]) => (
                        <div
                          key={key}
                          className="flex justify-between gap-4 py-3 text-sm"
                        >
                          <span className="capitalize text-gray-500">
                            {key.replace(/([A-Z])/g, " $1")}
                          </span>
                          <span className="font-bold text-brand-dark dark:text-white text-right">
                            {typeof value === "object"
                              ? JSON.stringify(value)
                              : String(value)}
                          </span>
                        </div>
                      ),
                    )
                  ) : (
                    <p className="py-4 text-sm text-gray-400">
                      No specifications available.
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-brand-pale dark:border-brand-dark/20 bg-white dark:bg-[#111827] p-6">
                <h2 className="text-base font-extrabold text-brand-dark dark:text-white flex items-center gap-2">
                  <History className="w-4 h-4 text-brand-blue" />
                  Audit History
                </h2>
                <div className="mt-4 space-y-3">
                  {logs.length === 0 ? (
                    <p className="text-sm text-gray-400">
                      No audit logs for this device.
                    </p>
                  ) : (
                    logs.map((log) => (
                      <div
                        key={log.id}
                        className="rounded-xl bg-gray-50 dark:bg-gray-900/30 p-3 text-xs"
                      >
                        <div className="flex justify-between gap-3">
                          <span className="font-black text-brand-blue">
                            {log.action}
                          </span>
                          <span className="text-gray-400">
                            {new Date(log.performedAt).toLocaleDateString()}
                          </span>
                        </div>
                        {log.remarks && (
                          <p className="mt-1 text-gray-500 dark:text-gray-400">
                            {log.remarks}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Layers, Tag, ShoppingCart, ChevronRight } from "lucide-react";

interface Device {
  id: string;
  name: string;
  brand: string;
  model: string;
  serialNumber: string;
  price: string;
  status: "AVAILABLE" | "IN_MAINTENANCE" | "DEPLOYED" | "RETIRED";
  imageUrl?: string;
  category: { id: string; name: string };
}

interface CatalogCardProps {
  device: Device;
  index: number;
  handleDeviceClick: (device: Device) => void;
  handleAddToCart: (device: Device) => void;
  getStatusColor: (status: string) => string;
}

export default function CatalogCard({
  device,
  index,
  handleDeviceClick,
  handleAddToCart,
  getStatusColor,
}: CatalogCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      className="bg-white dark:bg-[#111827] border border-amber-100 dark:border-amber-950/10 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-amber-500/[0.04] hover:border-amber-500/40 dark:hover:border-amber-500/30 transition-all duration-300 flex flex-col group relative"
    >
      {/* 🖼️ Premium Image Frame with Hover Zoom */}
      <div className="h-48 w-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/40 dark:to-gray-800/20 relative flex items-center justify-center overflow-hidden border-b border-gray-100 dark:border-gray-800/40 shrink-0">
        {device.imageUrl ? (
          <img
            src={device.imageUrl}
            alt={device.name}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-400 dark:text-gray-600">
            <Layers className="w-8 h-8 mb-2 stroke-[1.2] text-amber-500/40" />
            <span className="text-[9px] uppercase font-bold tracking-widest text-gray-400">
              No Asset Showcase
            </span>
          </div>
        )}
      </div>

      {/* 📝 Mid Section (Clickable Area) */}
      <div
        onClick={() => handleDeviceClick(device)}
        className="p-5 flex-1 space-y-4 cursor-pointer"
      >
        <div className="flex justify-between items-center gap-2">
          <span className="text-[10px] font-extrabold tracking-wider text-amber-600 dark:text-amber-400 uppercase px-2 py-1 bg-amber-50 dark:bg-amber-950/30 rounded-md border border-amber-100/50 dark:border-amber-900/20">
            {device.brand}
          </span>
          <span
            className={`text-[9px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider shadow-sm ${getStatusColor(
              device.status,
            )}`}
          >
            {device.status.replace("_", " ")}
          </span>
        </div>

        <div>
          <h4 className="text-sm font-extrabold text-gray-900 dark:text-white group-hover:text-amber-500 transition-colors duration-200 leading-snug truncate">
            {device.name}
          </h4>
          <p className="text-xs text-gray-400 dark:text-gray-400 font-medium mt-1">
            Model:{" "}
            <span className="text-gray-600 dark:text-gray-300">
              {device.model}
            </span>
          </p>
        </div>

        <div className="flex items-center space-x-2 pt-1.5 text-[11px] text-gray-400 border-t border-gray-50 dark:border-gray-800/50">
          <span className="bg-gray-100 dark:bg-gray-800/80 px-2 py-0.5 rounded font-mono text-[10px] text-gray-500 dark:text-gray-400">
            SN: {device.serialNumber}
          </span>
          <span className="text-gray-300 dark:text-gray-700">•</span>
          <span className="flex items-center text-gray-500 dark:text-gray-400 font-medium">
            <Tag className="w-3.5 h-3.5 mr-1 text-amber-500/70" />
            {device.category.name}
          </span>
        </div>
      </div>

      {/* 💵 Action Footer */}
      <div className="p-4 bg-gray-50/50 dark:bg-gray-900/20 border-t border-gray-100 dark:border-gray-800/40 flex items-center justify-between gap-3 mt-auto">
        <span className="text-base font-black text-gray-900 dark:text-white">
          $
          {Number(device.price).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>

        <div className="flex items-center gap-2.5">
          <Link
            href={`/devices/${device.id}`}
            className="text-[11px] text-gray-500 hover:text-amber-500 font-bold transition-colors flex items-center"
          >
            <span>Details</span>
            <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
          </Link>

          <button
            onClick={() => handleAddToCart(device)}
            className="p-2 rounded-xl bg-amber-500 text-white hover:bg-amber-600 active:scale-95 transition-all shadow-md shadow-amber-500/10 cursor-pointer"
            aria-label={`Add ${device.name} to cart`}
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

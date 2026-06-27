"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Search,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Layers,
  Tag,
  ShoppingCart,
} from "lucide-react";
import Link from "next/link";
import { Device } from "@/lib/api/device.api";

interface CatalogContentProps {
  devices: Device[];
  loading: boolean;
  search: string;
  setSearch: (value: string) => void;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;
  handleSearchSubmit: (e: React.FormEvent) => void;
  handleDeviceClick: (device: Device) => void;
  handleAddToCart: (device: Device) => void;
  getStatusColor: (status: string) => string;
}

export default function CatalogContent({
  devices,
  loading,
  search,
  setSearch,
  page,
  setPage,
  totalPages,
  handleSearchSubmit,
  handleDeviceClick,
  handleAddToCart,
  getStatusColor,
}: CatalogContentProps) {
  // Array ইমেজ এক্সট্রাকশন ইউটিলিটি
  const getDisplayImage = (device: Device): string => {
    if (!device.images || device.images.length === 0) return "";
    const primaryImg = device.images.find((img) => img.isPrimary);
    return primaryImg ? primaryImg.url : device.images[0].url;
  };

  return (
    <section className="flex-1 space-y-6">
      {/* Search Header */}
      <div className="bg-surface-0 border border-surface-300 rounded-xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <form
          onSubmit={handleSearchSubmit}
          className="w-full md:max-w-md relative"
        >
          <input
            type="text"
            placeholder="Query hardware index ledger..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-surface-300 bg-surface-50 text-sm text-text-primary outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
          />
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-3" />
        </form>

        <div className="text-xxs font-bold uppercase tracking-widest text-text-secondary bg-surface-100 px-3 py-1.5 rounded-md border border-surface-200">
          Assets Listed:{" "}
          <span className="text-brand-500">{devices.length} Units</span>
        </div>
      </div>

      {/* Grid Status Router */}
      {loading ? (
        <div className="flex flex-col justify-center items-center py-24 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
          <span className="text-xs font-semibold text-text-secondary">
            Syncing ledger records...
          </span>
        </div>
      ) : devices.length === 0 ? (
        <div className="bg-surface-0 border border-surface-300 rounded-xl p-16 text-center">
          <AlertCircle className="w-10 h-10 text-brand-400 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-text-primary uppercase tracking-wider">
            No Catalog Entry Logged
          </h4>
          <p className="text-xs text-text-secondary max-w-xs mx-auto mt-1">
            No devices matched the current matrix tags. Re-evaluate queries.
          </p>
        </div>
      ) : (
        <>
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {devices.map((device, index) => {
              const displayImageUrl = getDisplayImage(device);

              return (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  key={device.id}
                  className="bg-surface-0 border border-surface-300 rounded-xl overflow-hidden hover:border-brand-400 hover:shadow-md transition-all duration-200 flex flex-col group relative"
                >
                  {/* Image Container Panel */}
                  <div className="h-44 w-full bg-surface-50 relative flex items-center justify-center border-b border-surface-200 shrink-0 overflow-hidden">
                    {displayImageUrl ? (
                      <img
                        src={displayImageUrl}
                        alt={device.name}
                        className="object-cover w-full h-full group-hover:scale-102 transition-transform duration-300"
                      />
                    ) : (
                      <div className="text-center text-text-muted">
                        <Layers className="w-6 h-6 mx-auto mb-1 stroke-[1.2] text-surface-300" />
                        <span className="text-[9px] font-black uppercase tracking-widest">
                          No Plate Attached
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Primary Data Row Clickable */}
                  <div
                    onClick={() => handleDeviceClick(device)}
                    className="p-5 flex-1 space-y-3.5 cursor-pointer"
                  >
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-[9px] font-black tracking-widest text-accent-600 uppercase px-1.5 py-0.5 bg-surface-100 rounded border border-surface-200">
                        {device.brand}
                      </span>
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-md font-black uppercase tracking-wider border ${getStatusColor(device.status)}`}
                      >
                        {device.status.replace("_", " ")}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-black text-text-primary group-hover:text-brand-500 transition-colors leading-tight truncate">
                        {device.name}
                      </h4>
                      <p className="text-xs text-text-secondary mt-0.5">
                        Model:{" "}
                        <span className="font-semibold text-text-primary">
                          {device.model}
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center space-x-2 pt-2 text-[10px] text-text-muted border-t border-surface-100">
                      <span className="font-mono bg-surface-100 px-1.5 py-0.5 rounded text-text-secondary border border-surface-200">
                        SN: {device.serialNumber}
                      </span>
                      <span className="flex items-center">
                        <Tag className="w-3 h-3 mr-1 text-brand-400" />
                        {device.category.name}
                      </span>
                    </div>
                  </div>

                  {/* Pricing Register Action Board */}
                  <div className="p-4 bg-surface-50 border-t border-surface-200 flex items-center justify-between gap-3 mt-auto">
                    <span className="text-sm font-black text-text-primary">
                      $
                      {Number(device.price).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>

                    <div className="flex items-center gap-3">
                      <Link
                        href={`/devices/${device.id}`}
                        className="text-[10px] text-accent-500 hover:text-accent-600 font-black uppercase tracking-wider flex items-center"
                      >
                        <span>Specs</span>
                        <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                      </Link>
                      <button
                        onClick={() => handleAddToCart(device)}
                        className="p-2 rounded-lg bg-brand-500 text-surface-0 hover:bg-brand-600 active:scale-95 transition-all shadow-sm cursor-pointer"
                        aria-label="Add to cart"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Ledger Pagination System */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-3 pt-4">
              <button
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page === 1}
                className="p-2 border border-surface-300 bg-surface-0 hover:bg-surface-50 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed text-text-secondary cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-black text-text-secondary bg-surface-100 px-3 py-1.5 rounded-md border border-surface-200">
                Lgr Page {page} / {totalPages}
              </span>
              <button
                onClick={() =>
                  setPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={page === totalPages}
                className="p-2 border border-surface-300 bg-surface-0 hover:bg-surface-50 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed text-text-secondary cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}

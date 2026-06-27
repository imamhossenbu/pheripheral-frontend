"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Calendar,
  Wrench,
  Info,
  SlidersHorizontal,
  Activity,
} from "lucide-react";
import { Device } from "@/lib/api/device.api";


interface DeviceDetailsModalProps {
  selectedDevice: Device | null;
  setSelectedDevice: (device: Device | null) => void;
  getStatusColor: (status: string) => string;
}

export default function DeviceDetailsModal({
  selectedDevice,
  setSelectedDevice,
  getStatusColor,
}: DeviceDetailsModalProps) {
  if (!selectedDevice) return null;

  // মোডালের প্রাইমারি ইমেজ ফিল্টারিং লজিক
  const getModalDisplayImage = (): string => {
    if (!selectedDevice.images || selectedDevice.images.length === 0) return "";
    const primaryImg = selectedDevice.images.find((img) => img.isPrimary);
    return primaryImg ? primaryImg.url : selectedDevice.images[0].url;
  };

  const displayImageUrl = getModalDisplayImage();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Paper Blur Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          exit={{ opacity: 0 }}
          onClick={() => setSelectedDevice(null)}
          className="absolute inset-0 bg-text-primary/40 backdrop-blur-sm"
        />

        {/* Ledger Sheet Document Component */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          className="w-full max-w-2xl bg-surface-0 border border-surface-300 shadow-2xl rounded-xl overflow-hidden relative z-10 flex flex-col max-h-[85vh]"
        >
          {/* Document Header Panel */}
          <div className="p-6 border-b border-surface-200 flex items-start justify-between bg-surface-50">
            <div>
              <div className="flex items-center space-x-2.5 mb-2">
                <span className="text-[9px] font-black tracking-widest text-accent-600 uppercase px-1.5 py-0.5 bg-surface-0 rounded border border-surface-200">
                  {selectedDevice.brand}
                </span>
                <span
                  className={`text-[9px] px-2 py-0.5 rounded-md font-black uppercase tracking-wider border bg-surface-0 ${getStatusColor(selectedDevice.status)}`}
                >
                  {selectedDevice.status.replace("_", " ")}
                </span>
              </div>
              <h3 className="text-xl font-black text-text-primary tracking-tight">
                {selectedDevice.name}
              </h3>
              <p className="text-xs text-text-secondary mt-0.5">
                Asset Reference Model:{" "}
                <span className="font-bold text-text-primary">
                  {selectedDevice.model}
                </span>
              </p>
            </div>
            <button
              onClick={() => setSelectedDevice(null)}
              className="p-1.5 rounded-lg text-text-muted hover:bg-surface-200 hover:text-text-primary cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Ledger Sheet Attribute Body */}
          <div className="p-6 overflow-y-auto flex-1 space-y-5">
            {displayImageUrl && (
              <div className="w-full h-52 rounded-lg overflow-hidden bg-surface-50 border border-surface-200 relative">
                <img
                  src={displayImageUrl}
                  alt={selectedDevice.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Procurement / Valuation Tags */}
            <div className="bg-surface-50 border border-surface-200 rounded-lg p-4 grid grid-cols-2 gap-4">
              <div>
                <span className="text-[9px] text-text-secondary font-black uppercase tracking-wider">
                  Asset Plate SN
                </span>
                <p className="text-xs font-mono font-bold text-text-primary mt-0.5 bg-surface-0 border border-surface-300 px-1.5 py-0.5 rounded w-fit">
                  {selectedDevice.serialNumber}
                </p>
              </div>
              <div>
                <span className="text-[9px] text-text-secondary font-black uppercase tracking-wider">
                  Book Value
                </span>
                <p className="text-xs font-black text-brand-500 mt-1">
                  $
                  {Number(selectedDevice.price).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div>
                <span className="text-[9px] text-text-secondary font-black uppercase tracking-wider flex items-center">
                  <Calendar className="w-3 h-3 mr-1 text-brand-400" />{" "}
                  Procurement
                </span>
                <p className="text-xs font-semibold text-text-primary mt-0.5">
                  {new Date(selectedDevice.purchaseDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <span className="text-[9px] text-text-secondary font-black uppercase tracking-wider flex items-center">
                  <Wrench className="w-3 h-3 mr-1 text-brand-400" /> Lifecycle
                  Expiry
                </span>
                <p className="text-xs font-semibold text-text-primary mt-0.5">
                  {new Date(selectedDevice.warrantyExpiry).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Description Block */}
            <div className="space-y-1">
              <h4 className="text-[9px] font-black text-text-secondary uppercase tracking-widest flex items-center">
                <Info className="w-3.5 h-3.5 mr-1 text-brand-500" /> Operational
                Context
              </h4>
              <p className="text-xs text-text-secondary leading-relaxed bg-surface-50 p-3 rounded-lg border border-surface-200 font-medium">
                {selectedDevice.description ||
                  "No supplemental details bound to index plate."}
              </p>
            </div>

            {/* Mechanics Block */}
            <div className="space-y-1">
              <h4 className="text-[9px] font-black text-text-secondary uppercase tracking-widest flex items-center">
                <Activity className="w-3.5 h-3.5 mr-1 text-accent-400" />{" "}
                Technical Mechanics
              </h4>
              <div className="text-xs text-text-secondary leading-relaxed bg-surface-50 p-3 rounded-lg border border-surface-200 whitespace-pre-wrap font-medium">
                {selectedDevice.workingPrinciple ||
                  "System operators have not attached explicit logic models."}
              </div>
            </div>

            {/* Tech Attribute Schema List */}
            <div className="space-y-1.5">
              <h4 className="text-[9px] font-black text-text-secondary uppercase tracking-widest flex items-center">
                <SlidersHorizontal className="w-3.5 h-3.5 mr-1 text-accent-500" />{" "}
                Structure Registry
              </h4>
              <div className="border border-surface-200 rounded-lg overflow-hidden divide-y divide-surface-200 bg-surface-50">
                {selectedDevice.specifications &&
                Object.keys(selectedDevice.specifications).length > 0 ? (
                  Object.keys(selectedDevice.specifications).map((key) => (
                    <div
                      key={key}
                      className="flex justify-between items-center p-2.5 text-xs"
                    >
                      <span className="capitalize text-text-secondary font-semibold">
                        {key.replace(/([A-Z])/g, " $1")}
                      </span>
                      <span className="font-bold text-text-primary text-right">
                        {String(selectedDevice.specifications[key])}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-center text-xs text-text-muted italic">
                    No custom attributes specified.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Dismiss Footer Panel */}
          <div className="p-4 border-t border-surface-200 bg-surface-50 flex justify-end">
            <button
              onClick={() => setSelectedDevice(null)}
              className="bg-brand-500 hover:bg-brand-600 text-surface-0 font-bold py-1.5 px-5 rounded-lg text-xs cursor-pointer shadow-sm active:scale-98"
            >
              Dismiss View
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

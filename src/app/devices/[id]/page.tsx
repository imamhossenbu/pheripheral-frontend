/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { useCart } from "@/context/CartContext";


import {
  ArrowLeft,
  Calendar,
  Loader2,
  ShoppingCart,
  SlidersHorizontal,
  Layers,
  Wrench,
  HandHelping,
  MessageSquare,
  Star,
  User,
} from "lucide-react";
import toast from "react-hot-toast";
import { Device } from "@/lib/api/device.api";
import { deviceDetailsApi, Review } from "@/lib/api/deviceDetailsApi";
import DeviceAiChat from "@/components/device/DeviceAiChat";

export default function DeviceDetailsPage() {
  const params = useParams();
  const rawId = params?.id
    ? Array.isArray(params.id)
      ? params.id[0]
      : params.id
    : "";

  const { addItem } = useCart();

  const [device, setDevice] = useState<Device | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const [isBorrowing, setIsBorrowing] = useState(false);
  const [borrowReason, setBorrowReason] = useState("");

  // 📅 আলাদাভাবে Start Date এবং End Date হ্যান্ডেল করার জন্য স্টেট
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    if (!rawId) return;

    const loadPageData = async () => {
      setLoading(true);
      try {
        const [deviceData, reviewData] = await Promise.all([
          deviceDetailsApi.getDeviceById(rawId),
          deviceDetailsApi.getDeviceReviews(rawId),
        ]);
        setDevice(deviceData);
        setReviews(reviewData.data || []);
      } catch (err: any) {
        toast.error(err.message || "Failed to sync device ledger details.");
      } finally {
        setLoading(false);
      }
    };

    loadPageData();
  }, [rawId]);

  // আজকের তারিখ সেট করা যাতে ইউজার পেছনের কোনো ডেট সিলেক্ট না করতে পারে (YYYY-MM-DD ফরম্যাট)
  const todayStr = new Date().toISOString().split("T")[0];

  const addDeviceToCart = () => {
    if (!device) return;
    const displayImageUrl =
      device.images?.find((img) => img.isPrimary)?.url ||
      device.images?.[0]?.url ||
      "";
    addItem({
      id: device.id,
      name: device.name,
      brand: device.brand,
      model: device.model,
      price: Number(device.price),
      imageUrl: displayImageUrl,
    });
    toast.success(`${device.name} cataloged into checkout.`);
  };

  const handleBorrowSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const activeDeviceId = device?.id || rawId;
    const validatedReason = borrowReason.trim();

    // 🛡️ ক্লায়েন্ট সাইড কড়া ভ্যালিডেশন
    if (!activeDeviceId) {
      toast.error("Bad Request: deviceId should not be empty");
      return;
    }
    if (!startDate) {
      toast.error(
        "Bad Request: startDate must be a valid ISO 8601 date string",
      );
      return;
    }
    if (!endDate) {
      toast.error("Bad Request: endDate must be a valid ISO 8601 date string");
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      toast.error("Validation Error: End date cannot be before start date.");
      return;
    }
    if (!validatedReason) {
      toast.error("Bad Request: reason should not be empty");
      return;
    }

    setIsBorrowing(true);
    try {
      // ইনপুট ডেটগুলোকে পিওর ISO 8601 স্ট্রিং-এ রূপান্তর (e.g., 2026-03-31T00:00:00.000Z)
      const isoStartDate = new Date(startDate).toISOString();
      const isoEndDate = new Date(endDate).toISOString();

      await deviceDetailsApi.submitBorrowRequest(
        String(activeDeviceId),
        isoStartDate,
        isoEndDate,
        validatedReason,
      );

      toast.success("Borrow assignment pipeline requested successfully.");
      setBorrowReason("");
      setStartDate("");
      setEndDate("");
    } catch (err: any) {
      toast.error(err.message || "Failed to process allocation request.");
    } finally {
      setIsBorrowing(false);
    }
  };

  const getStatusColor = (deviceStatus: string) => {
    switch (deviceStatus) {
      case "AVAILABLE":
        return "text-success-500 bg-success-50 border-success-400/20";
      case "IN_MAINTENANCE":
        return "text-warning-500 bg-warning-50 border-warning-400/20";
      case "DEPLOYED":
        return "text-info-500 bg-info-50 border-info-400/20";
      case "RETIRED":
        return "text-danger-500 bg-danger-50 border-danger-400/20";
      default:
        return "text-text-secondary bg-surface-100 border-surface-200";
    }
  };

  const displayImageUrl =
    device?.images?.find((img) => img.isPrimary)?.url ||
    device?.images?.[0]?.url ||
    "";

  return (
    <div className="min-h-screen flex flex-col bg-surface-50 text-text-primary transition-colors duration-200">
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/catalog"
          className="inline-flex items-center gap-2 text-xs font-bold text-accent-500 hover:text-accent-600 mb-6 group transition-colors"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          <span>Return Hardware Ledger Index</span>
        </Link>

        {loading ? (
          <div className="flex flex-col justify-center items-center py-32 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
            <span className="text-xs font-semibold text-text-secondary">
              Syncing blueprint asset ledger...
            </span>
          </div>
        ) : !device ? (
          <div className="rounded-xl border border-surface-300 bg-surface-0 p-16 text-center shadow-sm">
            <span className="text-sm font-bold text-text-secondary uppercase tracking-wider">
              Asset records not found.
            </span>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-8 items-start">
            {/* LEFT GRID PANELS */}
            <section className="space-y-6">
              <div className="rounded-xl border border-surface-300 bg-surface-0 overflow-hidden shadow-sm">
                <div className="aspect-video bg-surface-50 flex items-center justify-center border-b border-surface-200 overflow-hidden relative">
                  {displayImageUrl ? (
                    <img
                      src={displayImageUrl}
                      alt={device.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center text-text-muted">
                      <Layers className="w-8 h-8 mx-auto mb-1.5 stroke-[1.2] text-surface-300" />
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        No Plate Attached
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[10px] font-black tracking-widest text-accent-600 uppercase px-2 py-0.5 bg-surface-50 rounded border border-surface-200">
                      {device.brand}
                    </span>
                    <span
                      className={`text-[9px] px-2.5 py-0.5 rounded-md font-black uppercase tracking-wider border ${getStatusColor(device.status)}`}
                    >
                      {device.status.replace("_", " ")}
                    </span>
                  </div>
                  <h1 className="mt-4 text-2xl font-black text-text-primary tracking-tight leading-tight">
                    {device.name}
                  </h1>
                  <div className="mt-2.5 flex items-center space-x-2 text-xs font-mono text-text-secondary">
                    <span className="bg-surface-50 px-1.5 py-0.5 rounded border border-surface-200">
                      Model: {device.model}
                    </span>
                    <span className="bg-surface-100 px-1.5 py-0.5 rounded border border-surface-200 font-bold text-text-primary">
                      SN: {device.serialNumber}
                    </span>
                  </div>
                  <button
                    onClick={addDeviceToCart}
                    className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 py-3 text-xs font-black uppercase tracking-wider text-surface-0 hover:bg-brand-600 active:scale-99 transition-all shadow-sm cursor-pointer"
                  >
                    <ShoppingCart className="w-4 h-4" />{" "}
                    <span>Catalog Into Checkout</span>
                  </button>
                </div>
              </div>

              {/* 🤖 AI CHAT INTERFACE HUB */}
              <DeviceAiChat deviceId={device.id} />

              <div className="rounded-xl border border-surface-300 bg-surface-0 p-5 shadow-sm">
                <h3 className="text-xs font-black text-text-primary uppercase tracking-wider mb-4 border-b border-surface-100 pb-2">
                  Operational Lifecycle
                </h3>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="bg-surface-50 border border-surface-200 rounded-lg p-3">
                    <p className="text-[9px] font-black uppercase tracking-wider text-text-secondary flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-brand-400" />{" "}
                      Procurement Entry
                    </p>
                    <p className="mt-1.5 text-text-primary font-bold">
                      {new Date(device.purchaseDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="bg-surface-50 border border-surface-200 rounded-lg p-3">
                    <p className="text-[9px] font-black uppercase tracking-wider text-text-secondary flex items-center gap-1">
                      <Wrench className="w-3.5 h-3.5 text-accent-400" />{" "}
                      Warranty Expiration
                    </p>
                    <p className="mt-1.5 text-text-primary font-bold">
                      {new Date(device.warrantyExpiry).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* RIGHT GRID PANELS */}
            <section className="space-y-6">
              <div className="rounded-xl border border-surface-300 bg-surface-0 p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4 border-b border-surface-100 pb-4">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-wider text-text-secondary">
                      Asset Book Valuation
                    </p>
                    <p className="mt-1 text-2xl font-black text-brand-500 tracking-tight">
                      $
                      {Number(device.price).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                  <span className="rounded-lg bg-surface-100 border border-surface-200 px-3 py-1.5 text-xxs font-black uppercase tracking-wider text-accent-600">
                    {device.category?.name || "Uncategorized"}
                  </span>
                </div>
                <div className="mt-4">
                  <p className="text-[9px] font-black uppercase tracking-widest text-text-muted mb-1 block">
                    Contextual Details
                  </p>
                  <p className="text-xs leading-relaxed text-text-secondary font-medium">
                    {device.description ||
                      "No supplemental descriptions bound to asset reference profile."}
                  </p>
                </div>
              </div>

              {/* 📅 BORROW REQUEST WORKFLOW WITH SEPARATE FIELDS */}
              <div className="rounded-xl border border-surface-300 bg-surface-0 p-6 shadow-sm">
                <h2 className="text-xs font-black text-text-primary uppercase tracking-wider flex items-center gap-2 border-b border-surface-100 pb-3">
                  <HandHelping className="w-4 h-4 text-brand-500" /> Request
                  Allocation/Borrow Assignment
                </h2>
                <form onSubmit={handleBorrowSubmit} className="mt-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Start Date Field */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-text-secondary tracking-wider block">
                        Start Date
                      </label>
                      <input
                        type="date"
                        min={todayStr}
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-lg border border-surface-300 bg-surface-50 text-text-primary outline-none focus:border-brand-500"
                      />
                    </div>
                    {/* End Date Field */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-text-secondary tracking-wider block">
                        End Date
                      </label>
                      <input
                        type="date"
                        min={startDate || todayStr}
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-lg border border-surface-300 bg-surface-50 text-text-primary outline-none focus:border-brand-500"
                      />
                    </div>
                  </div>

                  {/* Allocation Reason Field */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-text-secondary tracking-wider block">
                      Allocation Reason
                    </label>
                    <input
                      type="text"
                      placeholder="State the usage context for system validation..."
                      value={borrowReason}
                      onChange={(e) => setBorrowReason(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border border-surface-300 bg-surface-50 text-text-primary outline-none focus:border-brand-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isBorrowing || device.status !== "AVAILABLE"}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-accent-500 hover:bg-accent-600 disabled:bg-surface-200 disabled:text-text-muted text-surface-0 py-2.5 text-xs font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer"
                  >
                    {isBorrowing ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <span>Submit Allocation Request</span>
                    )}
                  </button>
                </form>
              </div>

              {/* STRUCT REGISTRY */}
              <div className="rounded-xl border border-surface-300 bg-surface-0 p-6 shadow-sm">
                <h2 className="text-xs font-black text-text-primary uppercase tracking-wider flex items-center gap-2 border-b border-surface-100 pb-3">
                  <SlidersHorizontal className="w-4 h-4 text-accent-500" />{" "}
                  Structure Registry Specifications
                </h2>
                <div className="mt-2 divide-y divide-surface-200">
                  {device.specifications &&
                  Object.keys(device.specifications).length > 0 ? (
                    Object.entries(device.specifications).map(
                      ([key, value]) => (
                        <div
                          key={key}
                          className="flex justify-between items-center gap-4 py-3 text-xs"
                        >
                          <span className="capitalize text-text-secondary font-semibold">
                            {key.replace(/([A-Z])/g, " $1")}
                          </span>
                          <span className="font-bold text-text-primary text-right">
                            {typeof value === "object"
                              ? JSON.stringify(value)
                              : String(value)}
                          </span>
                        </div>
                      ),
                    )
                  ) : (
                    <p className="py-4 text-xs text-text-muted italic">
                      No configurations registered.
                    </p>
                  )}
                </div>
              </div>

              {/* REVIEWS LIST */}
              <div className="rounded-xl border border-surface-300 bg-surface-0 p-6 shadow-sm">
                <h2 className="text-xs font-black text-text-primary uppercase tracking-wider flex items-center gap-2 border-b border-surface-100 pb-3">
                  <MessageSquare className="w-4 h-4 text-brand-500" /> Operator
                  Reviews ({reviews.length})
                </h2>
                <div className="mt-4 space-y-4 max-h-72 overflow-y-auto pr-1">
                  {reviews.length === 0 ? (
                    <p className="text-xs text-text-muted italic py-4 text-center">
                      No operator reviews indexed.
                    </p>
                  ) : (
                    reviews.map((review) => (
                      <div
                        key={review.id}
                        className="p-3 bg-surface-50 border border-surface-200 rounded-xl space-y-1.5 text-xs"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-center space-x-1.5">
                            <div className="p-1 bg-surface-200 rounded-md text-text-secondary">
                              <User className="w-3 h-3" />
                            </div>
                            <div>
                              <p className="font-bold text-text-primary text-xxs leading-none">
                                {review.user.name}
                              </p>
                              <span className="text-[9px] text-text-muted font-mono leading-none">
                                {review.user.email}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-0.5 bg-warning-50 border border-warning-200 text-warning-600 px-1.5 py-0.5 rounded text-[10px] font-bold">
                            <Star className="w-2.5 h-2.5 fill-warning-500 text-warning-500" />{" "}
                            <span>{review.rating}</span>
                          </div>
                        </div>
                        <p className="text-text-secondary font-medium leading-relaxed pl-1">
                          {review.comment}
                        </p>
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

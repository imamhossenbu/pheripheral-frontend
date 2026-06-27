/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useTransition } from "react";

import { ReviewStatusBadge } from "./ReviewStatusBadge";
import { ReviewModerateModal } from "./ReviewModerateModal";
import { StarRating } from "./StarRating";
import {
  Loader2,
  Trash2,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { DeviceReview, reviewService, ReviewStatus } from "@/lib/api/reviewApi";

interface Meta {
  total: number;
  page: number;
  totalPages: number;
}

interface Props {
  initialData: DeviceReview[];
  initialMeta: Meta;
}

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: ReviewStatus.PENDING, label: "Pending" },
  { value: ReviewStatus.APPROVED, label: "Approved" },
  { value: ReviewStatus.REJECTED, label: "Rejected" },
];

export function ReviewsClient({ initialData, initialMeta }: Props) {
  const [reviews, setReviews] = useState(initialData);
  const [meta, setMeta] = useState(initialMeta);
  const [loading, setLoading] = useState(false);
  const [selectedReview, setSelected] = useState<DeviceReview | null>(null);
  const [, startTransition] = useTransition();

  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<ReviewStatus | "">("");

  const load = async (p = page, s = status) => {
    setLoading(true);
    try {
      const res = await reviewService.getAll({
        page: p,
        status: (s as ReviewStatus) || undefined,
      });
      setReviews(res.data);
      setMeta(res.meta);
    } catch (err: any) {
      toast.error(err.message || "Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(page, status);
  }, [page, status]);

  const handleDelete = (id: string) => {
    if (!confirm("Delete this review permanently?")) return;
    startTransition(async () => {
      try {
        await reviewService.remove(id);
        toast.success("Review deleted");
        load(page, status);
      } catch (err: any) {
        toast.error(err.message || "Failed to delete");
      }
    });
  };

  const pendingCount = initialMeta.total;

  return (
    <div className="space-y-5">
      {/* Filter bar */}
      <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
          <SlidersHorizontal className="w-3.5 h-3.5" /> Filters
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-medium text-slate-400">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as ReviewStatus | "");
              setPage(1);
            }}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 min-w-[148px]"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {status && (
          <button
            onClick={() => {
              setStatus("");
              setPage(1);
            }}
            className="self-end px-3 py-1.5 text-xs font-medium text-slate-500 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-1.5"
          >
            <X className="w-3 h-3" /> Clear
          </button>
        )}

        <div className="ml-auto">
          <span className="text-xs text-slate-400">
            <span className="font-semibold text-slate-600">{meta.total}</span>{" "}
            reviews
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
            <p className="text-xs text-slate-400">Loading reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="py-20 text-center">
            <MessageSquare className="w-8 h-8 text-slate-200 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-400">
              No reviews found
            </p>
            <p className="text-xs text-slate-300 mt-1">Try changing filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {[
                    "Device",
                    "User",
                    "Rating",
                    "Comment",
                    "Status",
                    "Date",
                    "",
                  ].map((h, i) => (
                    <th
                      key={i}
                      className={`text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-5 py-3 ${i === 6 ? "w-20" : "text-left"}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reviews.map((r) => {
                  const userName =
                    [r.user.firstName, r.user.lastName]
                      .filter(Boolean)
                      .join(" ") || r.user.email;
                  return (
                    <tr
                      key={r.id}
                      className="hover:bg-orange-50/30 transition-colors group"
                    >
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-slate-800 text-sm">
                          {r.device.name}
                        </p>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-sm text-slate-700">{userName}</p>
                        <p className="text-[11px] text-slate-400 font-mono">
                          {r.user.email}
                        </p>
                      </td>
                      <td className="px-5 py-3.5">
                        <StarRating rating={r.rating} />
                      </td>
                      <td className="px-5 py-3.5 max-w-[220px]">
                        {r.comment ? (
                          <p
                            className="text-xs text-slate-500 truncate"
                            title={r.comment}
                          >
                            {r.comment}
                          </p>
                        ) : (
                          <span className="text-xs text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <ReviewStatusBadge status={r.status} />
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs text-slate-400">
                          {new Date(r.createdAt).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {r.status === ReviewStatus.PENDING && (
                            <button
                              onClick={() => setSelected(r)}
                              className="px-2.5 py-1 text-[11px] font-semibold bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                            >
                              Review
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(r.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div className="px-5 py-3.5 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs text-slate-400">
              Page {meta.page} of {meta.totalPages} &middot;{" "}
              <span className="font-medium text-slate-600">
                {meta.total} total
              </span>
            </p>
            <div className="flex items-center gap-1">
              <button
                disabled={meta.page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                disabled={meta.page >= meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Moderate modal */}
      {selectedReview && (
        <ReviewModerateModal
          review={selectedReview}
          onClose={() => setSelected(null)}
          onDone={() => load(page, status)}
        />
      )}
    </div>
  );
}

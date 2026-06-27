/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useTransition } from "react";
import { X, CheckCircle2, XCircle, Loader2 } from "lucide-react";

import { StarRating } from "./StarRating";
import toast from "react-hot-toast";
import { DeviceReview, reviewService, ReviewStatus } from "@/lib/api/reviewApi";

interface Props {
  review: DeviceReview;
  onClose: () => void;
  onDone: () => void;
}

export function ReviewModerateModal({ review, onClose, onDone }: Props) {
  const [isPending, startTransition] = useTransition();
  const [note, setNote] = useState("");

  const userName =
    [review.user.firstName, review.user.lastName].filter(Boolean).join(" ") ||
    review.user.email;

  const handle = (status: ReviewStatus.APPROVED | ReviewStatus.REJECTED) => {
    startTransition(async () => {
      try {
        await reviewService.moderate(review.id, {
          status,
          adminNote: note.trim() || undefined,
        });
        toast.success(
          status === ReviewStatus.APPROVED
            ? "Review approved"
            : "Review rejected",
        );
        onDone();
        onClose();
      } catch (err: any) {
        toast.error(err.message || "Action failed");
      }
    });
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/25 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-800">
              Moderate Review
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Review card */}
          <div className="px-6 py-5 space-y-4">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {review.device.name}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">by {userName}</p>
                </div>
                <StarRating rating={review.rating} />
              </div>
              {review.comment && (
                <p className="text-sm text-slate-600 leading-relaxed">
                  {review.comment}
                </p>
              )}
              <p className="text-[11px] text-slate-400">
                {new Date(review.createdAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>

            {/* Admin note */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Note to user{" "}
                <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Reason for approval or rejection..."
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-800 placeholder-slate-300 outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 transition-colors resize-none"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={() => handle(ReviewStatus.REJECTED)}
              disabled={isPending}
              className="px-4 py-2 text-sm font-semibold text-red-500 border border-red-200 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              {isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <XCircle className="w-3.5 h-3.5" />
              )}
              Reject
            </button>
            <button
              onClick={() => handle(ReviewStatus.APPROVED)}
              disabled={isPending}
              className="px-4 py-2 text-sm font-semibold bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              {isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5" />
              )}
              Approve
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

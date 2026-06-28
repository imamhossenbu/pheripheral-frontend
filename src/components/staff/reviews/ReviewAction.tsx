'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { moderateReview, deleteReview, ReviewStatus } from '@/lib/staff/misc-api';

interface ReviewActionsProps {
  reviewId: string;
  status: ReviewStatus;
}

export function ReviewActions({ reviewId, status }: ReviewActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [err, setErr]         = useState<string | null>(null);

  const act = async (fn: () => Promise<any>) => {
    setLoading(true); setErr(null);
    try { await fn(); router.refresh(); }
    catch (e: any) { setErr(e?.message ?? 'Failed.'); }
    finally { setLoading(false); }
  };

  if (status !== 'PENDING') {
    return (
      <button
        className="btn btn-ghost btn-xs text-[var(--color-danger-500)]"
        onClick={() => act(() => deleteReview(reviewId))}
        disabled={loading}
        title="Delete review"
      >
        {loading ? '…' : 'Delete'}
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-1 items-end">
      {err && <p className="text-xs text-[var(--color-danger-500)]">{err}</p>}
      <div className="flex gap-2">
        <button
          className="btn btn-xs btn-primary"
          onClick={() => act(() => moderateReview(reviewId, { status: 'APPROVED' }))}
          disabled={loading}
        >
          {loading ? '…' : '✓ Approve'}
        </button>
        <button
          className="btn btn-xs btn-danger"
          onClick={() => act(() => moderateReview(reviewId, { status: 'REJECTED' }))}
          disabled={loading}
        >
          {loading ? '…' : '✕ Reject'}
        </button>
      </div>
    </div>
  );
}
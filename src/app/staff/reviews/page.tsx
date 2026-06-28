// app/staff/reviews/page.tsx — Server Component
'use server';

import Link from 'next/link';
import { fetchReviews, ReviewQueryParams, ReviewStatus,
  REVIEW_STATUS_LABEL, REVIEW_STATUS_BADGE } from '@/lib/staff/misc-api';
import { ReviewActions } from '@/components/staff/reviews/ReviewAction';


interface PageProps {
  searchParams: { page?: string; status?: string };
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex gap-0.5 text-base">
      {[1,2,3,4,5].map(i => (
        <span key={i} className={i <= rating ? 'text-[var(--color-warning-400)]' : 'text-[var(--color-surface-300)]'}>★</span>
      ))}
    </span>
  );
}

export default async function ReviewsPage({ searchParams }: PageProps) {
  const params: ReviewQueryParams = {
    page:  searchParams.page ? parseInt(searchParams.page, 10) : 1,
    limit: 15,
    ...(searchParams.status && { status: searchParams.status as ReviewStatus }),
  };

  const { data: reviews, meta } = await fetchReviews(params);
  const pendingCount = reviews.filter(r => r.status === 'PENDING').length;

  return (
    <div className="dashboard-content">
      <div className="max-w-[1100px] mx-auto space-y-6">

        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <span className="text-overline mb-2 block">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand-500)] inline-block" />
              Staff Panel
            </span>
            <h1 className="text-heading-xl">Device Reviews</h1>
            <p className="text-body mt-1">Moderate student reviews before they go public.</p>
          </div>
          {pendingCount > 0 && (
            <div className="alert alert-warning self-start py-2 px-3 mt-1">
              <span className="font-semibold">{pendingCount} pending moderation</span>
            </div>
          )}
        </div>

        {/* Status filter */}
        <form method="GET" className="flex gap-1 flex-wrap">
          {(['', 'PENDING', 'APPROVED', 'REJECTED'] as const).map(s => (
            <button key={s} name="status" value={s} type="submit"
              className={`btn btn-sm ${(searchParams.status ?? '') === s ? 'btn-primary' : 'btn-ghost'}`}>
              {s === '' ? 'All' : REVIEW_STATUS_LABEL[s]}
            </button>
          ))}
        </form>

        <div className="card card-lg p-0 overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--color-surface-300)]">
            <h2 className="text-heading-sm">Reviews</h2>
            <span className="badge badge-muted">{meta.total}</span>
          </div>

          <div className="divide-y divide-[var(--color-surface-200)]">
            {reviews.length === 0 ? (
              <div className="text-center py-16">
                <span className="tag-code text-base px-4 py-2 inline-block mb-3">REV-000</span>
                <p className="text-[var(--color-text-muted)]">No reviews found</p>
              </div>
            ) : reviews.map(r => {
              const name = [r.user.firstName, r.user.lastName].filter(Boolean).join(' ') || r.user.email;
              const initials = [r.user.firstName?.[0], r.user.lastName?.[0]].filter(Boolean).join('').toUpperCase()
                || r.user.email[0].toUpperCase();
              return (
                <div key={r.id} className={`p-5 ${r.status === 'PENDING' ? 'bg-[var(--color-warning-50)]' : ''}`}>
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="avatar avatar-sm flex-shrink-0">{initials}</div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-[var(--color-text-primary)]">{name}</span>
                          <Stars rating={r.rating} />
                          <span className={REVIEW_STATUS_BADGE[r.status]}>{REVIEW_STATUS_LABEL[r.status]}</span>
                        </div>
                        <p className="text-caption mt-0.5">{r.device.name} · {r.device.brand}</p>
                        {r.comment && (
                          <p className="text-sm text-[var(--color-text-secondary)] mt-2 leading-relaxed">
                            {r.comment}
                          </p>
                        )}
                      </div>
                    </div>
                    {/* Client component handles approve/reject buttons */}
                    <ReviewActions reviewId={r.id} status={r.status} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

import { ReviewsClient } from "@/components/admin/review/ReviewClient";
import { reviewService, ReviewStatus } from "@/lib/api/reviewApi";
import { MessageSquare } from "lucide-react";

interface Props {
  searchParams: Promise<{
    page?: string;
    status?: string;
  }>;
}

export default async function AdminReviewsPage({ searchParams }: Props) {
  const params = await searchParams;

  const { data, meta } = await reviewService.getAll({
    page: params.page ? Number(params.page) : 1,
    status: params.status as ReviewStatus | undefined,
  });

  // Pending count for the header badge
  const { meta: pendingMeta } = await reviewService.getAll({
    status: ReviewStatus.PENDING,
    limit: 1,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-overline">Moderation</p>
          <div className="flex items-center gap-3 mt-2">
            <h1 className="text-heading-xl">Reviews</h1>
            {pendingMeta.total > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-600 border border-orange-200">
                <MessageSquare className="w-3 h-3" />
                {pendingMeta.total} pending
              </span>
            )}
          </div>
          <p className="text-body mt-2 max-w-2xl">
            Approve or reject user reviews before they go public.
          </p>
        </div>
      </div>

      <ReviewsClient initialData={data} initialMeta={meta} />
    </div>
  );
}

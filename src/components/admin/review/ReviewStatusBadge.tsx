
import { ReviewStatus } from "@/lib/api/reviewApi";
import { Clock, CheckCircle2, XCircle } from "lucide-react";

const CONFIG: Record<
  ReviewStatus,
  { label: string; icon: React.ReactNode; cls: string }
> = {
  PENDING: {
    label: "Pending",
    icon: <Clock className="w-3 h-3" />,
    cls: "bg-amber-50  text-amber-600  border-amber-200",
  },
  APPROVED: {
    label: "Approved",
    icon: <CheckCircle2 className="w-3 h-3" />,
    cls: "bg-green-50  text-green-600  border-green-200",
  },
  REJECTED: {
    label: "Rejected",
    icon: <XCircle className="w-3 h-3" />,
    cls: "bg-red-50    text-red-500    border-red-200",
  },
};

export function ReviewStatusBadge({ status }: { status: ReviewStatus }) {
  const { label, icon, cls } = CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${cls}`}
    >
      {icon}
      {label}
    </span>
  );
}

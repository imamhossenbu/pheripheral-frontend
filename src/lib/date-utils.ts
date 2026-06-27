export interface TimeRemaining {
  days: number;
  isOverdue: boolean;
  statusText: string;
}

export function calculateTimeRemaining(
  endDateStr: string,
  returnedAtStr?: string | null,
): TimeRemaining {
  // যদি অলরেডি ডিভাইসটি রিটার্ন করা হয়ে থাকে
  if (returnedAtStr) {
    return { days: 0, isOverdue: false, statusText: "Returned" };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(endDateStr);
  end.setHours(0, 0, 0, 0);

  const diffTime = end.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      days: Math.abs(diffDays),
      isOverdue: true,
      statusText: `${Math.abs(diffDays)} days overdue`,
    };
  }

  if (diffDays === 0) {
    return { days: 0, isOverdue: false, statusText: "Expires today" };
  }

  return {
    days: diffDays,
    isOverdue: false,
    statusText: `${diffDays} days remaining`,
  };
}

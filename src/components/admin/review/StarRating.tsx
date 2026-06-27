import { Star } from "lucide-react";

export function StarRating({
  rating,
  max = 5,
}: {
  rating: number;
  max?: number;
}) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${
            i < rating
              ? "fill-orange-400 text-orange-400"
              : "fill-slate-100 text-slate-200"
          }`}
        />
      ))}
    </div>
  );
}

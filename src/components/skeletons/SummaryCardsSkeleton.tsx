import { StatsCardSkeleton } from "@/components/skeletons/StatsCardSkeleton";

export function SummaryCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 w-full">
      {[...Array(5)].map((_, i) => (
        <StatsCardSkeleton key={i} />
      ))}
    </div>
  );
}

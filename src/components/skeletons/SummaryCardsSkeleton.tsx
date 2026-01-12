import { StatsCardsSkeleton } from "@/components/skeletons/StatsCardsSkeleton";

export function SummaryCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 w-full">
      {[...Array(5)].map((_, i) => (
        <StatsCardsSkeleton key={i} />
      ))}
    </div>
  );
}

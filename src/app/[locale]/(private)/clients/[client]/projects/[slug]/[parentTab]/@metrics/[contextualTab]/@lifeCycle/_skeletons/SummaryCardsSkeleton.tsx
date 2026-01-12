import { StatsCardsSkeleton } from "@/components/skeletons/StatsCardsSkeleton";
import { cn } from "@/lib/utils";

interface ISummaryCardsSkeleton {
  colsCount?: number;
}

// _components/skeletons/summary-cards-skeleton.tsx
export function SummaryCardsSkeleton({ colsCount = 5 }: ISummaryCardsSkeleton) {
  const colsCountMap: Record<number, string> = {
    1: "md:grid-cols-1",
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
    4: "md:grid-cols-4",
    5: "md:grid-cols-5",
  };

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 w-full",
        colsCountMap[colsCount] || colsCountMap[5]
      )}
    >
      {[...Array(5)].map((_, i) => (
        <StatsCardsSkeleton key={i} />
      ))}
    </div>
  );
}

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function StatsCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-lg shrink-0" />
        <div className="w-full flex flex-col items-end">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3 w-28 mt-2" />
        </div>
      </CardContent>
    </Card>
  );
}

interface StatsCardGridSkeletonProps {
  count?: number;
  className?: string;
}

export function StatsCardGridSkeleton({
  count = 4,
  className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4",
}: StatsCardGridSkeletonProps) {
  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, index) => (
        <StatsCardSkeleton key={index} />
      ))}
    </div>
  );
}

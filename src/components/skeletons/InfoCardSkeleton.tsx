import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/utils/twMerge";

interface InfoCardSkeletonProps {
  className?: string;
  fields?: number;
  columns?: 1 | 2;
}

export function InfoCardSkeleton({
  className,
  fields = 4,
  columns = 2,
}: InfoCardSkeletonProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-5 w-40" />
        </div>
      </CardHeader>
      <CardContent
        className={cn(
          "gap-8",
          columns === 2 ? "grid md:grid-cols-2 gap-y-6 gap-x-8" : "space-y-4",
        )}
      >
        {Array.from({ length: fields }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-5 w-full max-w-[200px]" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

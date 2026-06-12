import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/utils/twMerge";

interface UserSectionCardSkeletonProps {
  rows?: number;
  collapsible?: boolean;
}

export function UserSectionCardSkeleton({
  rows = 2,
  collapsible = false,
}: UserSectionCardSkeletonProps) {
  return (
    <div className="bg-card rounded-2xl shadow-xl p-8 mb-6 border">
      <div
        className={cn(
          "flex items-center justify-between",
          !collapsible && "mb-6",
        )}
      >
        <div className="flex items-center space-x-3">
          <Skeleton className="h-6 w-6 rounded" />
          <Skeleton className="h-8 w-48" />
        </div>
        {collapsible && <Skeleton className="h-5 w-5 shrink-0 rounded" />}
      </div>

      {!collapsible && (
        <div className="space-y-3">
          {Array.from({ length: rows }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      )}
    </div>
  );
}

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/utils/twMerge";

interface SectionHeadingSkeletonProps {
  marginBottom?: string;
  descriptionWidth?: string;
}

export function SectionHeadingSkeleton({
  marginBottom = "mb-8",
  descriptionWidth = "w-72",
}: SectionHeadingSkeletonProps) {
  return (
    <div className={marginBottom}>
      <Skeleton className="h-9 w-56 mb-2" />
      <Skeleton className={cn("h-5", descriptionWidth)} />
    </div>
  );
}

export function PageTitleSkeleton() {
  return (
    <div>
      <Skeleton className="h-9 w-48" />
      <Skeleton className="h-5 w-72 mt-2" />
    </div>
  );
}

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/utils/twMerge";

interface GlassTabsListSkeletonProps {
  tabCount: number;
  className?: string;
  variant?: "client" | "organization" | "project";
}

export function GlassTabsListSkeleton({
  tabCount,
  className,
  variant = "client",
}: GlassTabsListSkeletonProps) {
  const isOrganization = variant === "organization";

  return (
    <div
      className={cn(
        "w-full flex flex-col md:flex-row mb-2 items-center glass-effect rounded-lg p-1 gap-1",
        isOrganization
          ? "mb-6 justify-start gap-2 bg-muted/50"
          : "justify-evenly",
        className,
      )}
    >
      {Array.from({ length: tabCount }).map((_, index) => (
        <Skeleton
          key={index}
          className={cn(
            "h-10 rounded-md",
            isOrganization ? "w-full max-w-[140px] px-6" : "w-full flex-1",
            variant === "project" && "max-w-none",
          )}
        />
      ))}
    </div>
  );
}

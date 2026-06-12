import { PieChartCardSkeleton } from "./ChartCardSkeleton";
import { cn } from "@/utils/twMerge";

export function PieChartSkeleton({ className }: { className?: string }) {
  return <PieChartCardSkeleton className={cn(className)} />;
}

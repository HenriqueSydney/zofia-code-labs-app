import { ChartCardSkeleton } from "./ChartCardSkeleton";
import { cn } from "@/utils/twMerge";

export function BarChartSkeleton({
  className,
  height = 350,
}: {
  className?: string;
  height?: number;
}) {
  return <ChartCardSkeleton className={cn(className)} height={height} />;
}

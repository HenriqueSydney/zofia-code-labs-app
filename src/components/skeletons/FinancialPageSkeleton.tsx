import { Skeleton } from "@/components/ui/skeleton";
import { StatsCardGridSkeleton } from "./StatsCardSkeleton";
import { ChartCardSkeleton, PieChartCardSkeleton } from "./ChartCardSkeleton";
import { TableCardSkeleton } from "./TableCardSkeleton";
import { PageTitleSkeleton } from "./SectionHeadingSkeleton";

export function FinancialPageSkeleton() {
  return (
    <div className="space-y-6 p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageTitleSkeleton />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-28 rounded-md" />
          <Skeleton className="h-10 w-40 rounded-md" />
        </div>
      </div>

      <StatsCardGridSkeleton className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartCardSkeleton height={300} />
        </div>
        <PieChartCardSkeleton />
      </div>

      <div className="space-y-4">
        <div className="inline-flex h-10 items-center gap-1 rounded-lg bg-muted p-1">
          <Skeleton className="h-8 w-32 rounded-md" />
          <Skeleton className="h-8 w-28 rounded-md" />
          <Skeleton className="h-8 w-32 rounded-md" />
        </div>
        <TableCardSkeleton columns={5} rows={5} />
      </div>
    </div>
  );
}

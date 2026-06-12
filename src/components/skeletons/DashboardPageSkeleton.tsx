import { PageTitleSkeleton } from "./SectionHeadingSkeleton";
import { StatsCardGridSkeleton } from "./StatsCardSkeleton";
import { ChartCardSkeleton } from "./ChartCardSkeleton";
import { TableCardSkeleton } from "./TableCardSkeleton";

export function DashboardPageSkeleton() {
  return (
    <div className="space-y-6 p-8">
      <PageTitleSkeleton />
      <StatsCardGridSkeleton className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-3">
          <ChartCardSkeleton height={350} />
        </div>
        <div className="col-span-4">
          <ChartCardSkeleton height={350} />
        </div>
      </div>
      <TableCardSkeleton columns={5} rows={5} />
    </div>
  );
}

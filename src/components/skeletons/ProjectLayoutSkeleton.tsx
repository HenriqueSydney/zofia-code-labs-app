import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { GlassTabsListSkeleton } from "./GlassTabsListSkeleton";
import { InfoCardSkeleton } from "./InfoCardSkeleton";
import { SectionHeadingSkeleton } from "./SectionHeadingSkeleton";
import { StatsCardGridSkeleton } from "./StatsCardSkeleton";
import { TableCardSkeleton } from "./TableCardSkeleton";

export function ProjectOverviewContentSkeleton() {
  return (
    <div className="space-y-6 mt-6">
      <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
        <InfoCardSkeleton className="lg:col-span-2" fields={5} columns={1} />
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-9 w-28 rounded-md" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Skeleton className="h-8 w-8 rounded shrink-0" />
                  <div className="space-y-1 min-w-0">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-8 w-8 rounded-md shrink-0" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72 mt-2" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Skeleton className="h-5 w-32" />
            <div className="flex gap-2 overflow-hidden">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton
                  key={index}
                  className="h-12 w-32 rounded-lg shrink-0"
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TableCardSkeleton columns={1} rows={3} />
        <TableCardSkeleton columns={1} rows={4} />
      </div>
    </div>
  );
}

export function ProjectLayoutSkeleton() {
  return (
    <div className="space-y-6 mb-6">
      <div className="flex gap-5 items-start">
        <Skeleton className="h-10 w-10 rounded-md shrink-0 mt-2" />
        <div className="flex-1 min-w-0">
          <SectionHeadingSkeleton marginBottom="mb-0" descriptionWidth="w-56" />
        </div>
        <Skeleton className="h-6 w-24 rounded-full shrink-0 mt-2" />
      </div>

      <StatsCardGridSkeleton />

      <div className="w-full">
        <GlassTabsListSkeleton tabCount={5} variant="project" />
        <ProjectOverviewContentSkeleton />
      </div>
    </div>
  );
}

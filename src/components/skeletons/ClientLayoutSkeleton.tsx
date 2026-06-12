import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { GlassTabsListSkeleton } from "./GlassTabsListSkeleton";
import { InfoCardSkeleton } from "./InfoCardSkeleton";
import { SectionHeadingSkeleton } from "./SectionHeadingSkeleton";
import { StatsCardGridSkeleton } from "./StatsCardSkeleton";
import { TableCardSkeleton } from "./TableCardSkeleton";

export function ClientOverviewContentSkeleton() {
  return (
    <div className="space-y-6 mt-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <InfoCardSkeleton className="lg:col-span-2" fields={6} />
        <InfoCardSkeleton fields={3} columns={1} />
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-between items-end">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-8 w-12" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
            <div className="pt-4 border-t space-y-3">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <TableCardSkeleton columns={4} rows={4} />
    </div>
  );
}

export function ClientLayoutSkeleton() {
  return (
    <div className="space-y-6 mb-10">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex gap-5 items-start">
            <Skeleton className="h-10 w-10 rounded-md shrink-0 mt-2" />
            <Skeleton className="h-20 w-20 rounded-lg shrink-0" />
            <div>
              <SectionHeadingSkeleton marginBottom="mb-2" descriptionWidth="w-48" />
              <div className="flex gap-4">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-4 w-44" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
        <StatsCardGridSkeleton />
      </div>

      <div className="w-full">
        <GlassTabsListSkeleton tabCount={7} variant="client" />
        <ClientOverviewContentSkeleton />
      </div>
    </div>
  );
}

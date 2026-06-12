import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { GlassTabsListSkeleton } from "./GlassTabsListSkeleton";
import { InfoCardSkeleton } from "./InfoCardSkeleton";
import { SectionHeadingSkeleton } from "./SectionHeadingSkeleton";
import { StatsCardGridSkeleton } from "./StatsCardSkeleton";

export function OrganizationOverviewContentSkeleton() {
  return (
    <div className="space-y-6 mt-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <InfoCardSkeleton className="lg:col-span-2 shadow-sm" fields={6} />
        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-5 w-36" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex justify-between items-center">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-6 w-12 rounded-full" />
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader>
              <Skeleton className="h-5 w-40" />
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-10 w-full rounded-md" />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export function OrganizationLayoutSkeleton() {
  return (
    <div className="space-y-6 mb-10">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex gap-5 items-center">
            <Skeleton className="h-10 w-10 rounded-md shrink-0" />
            <Skeleton className="h-20 w-20 rounded-xl shrink-0" />
            <div>
              <SectionHeadingSkeleton marginBottom="mb-1" descriptionWidth="w-32" />
              <div className="flex flex-wrap gap-4 mt-2">
                <Skeleton className="h-6 w-28 rounded-md" />
                <Skeleton className="h-6 w-24 rounded-md" />
                <Skeleton className="h-6 w-32 rounded-md" />
              </div>
            </div>
          </div>
        </div>
        <StatsCardGridSkeleton />
      </div>

      <div className="w-full">
        <GlassTabsListSkeleton tabCount={5} variant="organization" />
        <OrganizationOverviewContentSkeleton />
      </div>
    </div>
  );
}

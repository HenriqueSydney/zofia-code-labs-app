import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadingBar } from "@/components/ui/loading-bar";

export const ServiceCatalogSkeleton = () => {
  return (
    <div className="space-y-6">
      <LoadingBar className="fixed top-0 left-0 right-0 z-50" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-9 w-64 mb-2" />
          <Skeleton className="h-5 w-80" />
        </div>
        <Skeleton className="h-10 w-36 rounded-md" />
      </div>

      {/* Search */}
      <Skeleton className="h-10 w-full rounded-md" />

      {/* Service Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-9 w-9 rounded-lg" />
                  <div>
                    <Skeleton className="h-5 w-28 mb-2" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                </div>
                <div className="flex gap-1">
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <div className="flex flex-wrap gap-1">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-5 w-16 rounded-full" />
                ))}
              </div>
              <Skeleton className="h-7 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

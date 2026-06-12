import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionHeadingSkeleton } from "./SectionHeadingSkeleton";

export function ClientsListPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <SectionHeadingSkeleton marginBottom="mb-0" />
        <Skeleton className="h-10 w-36 shrink-0 rounded-md" />
      </div>

      <div className="relative">
        <Skeleton className="absolute left-3 top-3 h-4 w-4 rounded" />
        <Skeleton className="h-10 w-full max-w-md rounded-md pl-10" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <Skeleton className="h-16 w-24 rounded-lg shrink-0" />
                  <div className="space-y-2 min-w-0">
                    <Skeleton className="h-5 w-full max-w-[140px]" />
                    <Skeleton className="h-5 w-28 rounded-full" />
                  </div>
                </div>
                <Skeleton className="h-8 w-8 rounded-md shrink-0" />
              </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-4">
              <Skeleton className="h-4 w-3/4" />
              <div className="mt-auto space-y-2 pt-2 border-t">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded shrink-0" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded shrink-0" />
                  <Skeleton className="h-4 w-full max-w-[180px]" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded shrink-0" />
                  <Skeleton className="h-4 w-28" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

import { Skeleton } from "@/components/ui/skeleton";

export function ProfileCardSkeleton() {
  return (
    <div className="bg-card rounded-2xl shadow-xl overflow-hidden mb-6 border">
      <Skeleton className="h-32 w-full rounded-none" />
      <div className="px-8 pb-8">
        <div className="flex flex-col md:flex-row md:items-end -mt-14 mb-6">
          <div className="flex items-end space-x-4">
            <Skeleton className="h-24 w-24 rounded-full shrink-0" />
            <div className="pb-2 space-y-2">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-56" />
            </div>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

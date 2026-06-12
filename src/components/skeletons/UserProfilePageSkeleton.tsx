import { Skeleton } from "@/components/ui/skeleton";
import { ProfileCardSkeleton } from "@/app/[locale]/(private)/user/[userId]/components/skeletons/ProfileCardSkeleton";
import { UserSectionCardSkeleton } from "@/app/[locale]/(private)/user/[userId]/components/skeletons/UserSectionCardSkeleton";
import { UserPermissionsSkeleton } from "@/app/[locale]/(private)/user/[userId]/components/skeletons/UserPermissionsSkeleton";

export function UserProfilePageSkeleton() {
  return (
    <div className="p-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <Skeleton className="h-10 w-48 mb-2" />
          <Skeleton className="h-5 w-72" />
        </div>
        <ProfileCardSkeleton />
        <UserSectionCardSkeleton rows={2} />
        <UserPermissionsSkeleton />
        <UserSectionCardSkeleton collapsible />
        <UserSectionCardSkeleton collapsible />
        <UserSectionCardSkeleton collapsible />
        <div className="mt-6 text-center space-y-4">
          <Skeleton className="h-4 w-64 mx-auto" />
          <Skeleton className="h-4 w-48 mx-auto" />
        </div>
      </div>
    </div>
  );
}

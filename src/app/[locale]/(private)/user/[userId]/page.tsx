import { Suspense } from "react";
import { auth } from "@/auth";
import { PERMISSIONS } from "@/constants/permissions";
import { ValidationError } from "@/errors";
import { Role } from "@/generated/prisma/enums";
import { hasPermission } from "@/utils/hasPermission";
import { getTranslations } from "next-intl/server";
import { Skeleton } from "@/components/ui/skeleton";
import { MainProfileCardSection } from "./components/MainProfileCardSection";
import { OrganizationInfoSection } from "./components/OrganizationInfoSection";
import { UserPermissionsSection } from "./components/UserPermissionsSection";
import { SecuritySectionContainer } from "./components/SecuritySectionContainer";
import { ConnectedAccountsSectionContainer } from "./components/ConnectedAccountsSectionContainer";
import { LoginHistorySectionContainer } from "./components/LoginHistorySectionContainer";
import { UserProfileFooter } from "./components/UserProfileFooter";
import { ProfileCardSkeleton } from "./components/skeletons/ProfileCardSkeleton";
import { UserSectionCardSkeleton } from "./components/skeletons/UserSectionCardSkeleton";
import { UserPermissionsSkeleton } from "./components/skeletons/UserPermissionsSkeleton";

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const [operatiorSession, t] = await Promise.all([
    auth(),
    getTranslations("userProfile"),
  ]);

  if (!operatiorSession) {
    throw new ValidationError(t("errors.mustBeLoggedIn"));
  }

  const sessionUser = operatiorSession.user;
  const isSameUser = sessionUser.id === userId;
  const canManageMembers =
    sessionUser.role === Role.OWNER ||
    hasPermission(sessionUser, PERMISSIONS.SETTINGS.MANAGE_MEMBERS);

  if (!isSameUser && !canManageMembers) {
    throw new ValidationError(t("errors.unauthorizedAccess"));
  }

  const canViewSensitiveSections = isSameUser;
  const canViewPermissions = isSameUser || canManageMembers;

  return (
    <div className="p-4">
      <div className="max-w-5xl mx-auto">
        {!isSameUser && (
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">{t("title")}</h1>
          </div>
        )}

        {isSameUser && (
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">{t("myProfile")}</h1>
            <p className="text-slate-600">{t("description")}</p>
          </div>
        )}

        <Suspense fallback={<ProfileCardSkeleton />}>
          <MainProfileCardSection userId={userId} canEdit={isSameUser} />
        </Suspense>

        <Suspense fallback={<UserSectionCardSkeleton rows={2} />}>
          <OrganizationInfoSection userId={userId} />
        </Suspense>

        {canViewPermissions && (
          <Suspense fallback={<UserPermissionsSkeleton />}>
            <UserPermissionsSection userId={userId} />
          </Suspense>
        )}

        {canViewSensitiveSections && (
          <>
            <Suspense fallback={<UserSectionCardSkeleton collapsible />}>
              <SecuritySectionContainer userId={userId} />
            </Suspense>

            <Suspense fallback={<UserSectionCardSkeleton collapsible />}>
              <ConnectedAccountsSectionContainer userId={userId} />
            </Suspense>

            <Suspense fallback={<UserSectionCardSkeleton collapsible />}>
              <LoginHistorySectionContainer userId={userId} />
            </Suspense>
          </>
        )}

        <Suspense
          fallback={
            <div className="mt-6 text-center space-y-4">
              <Skeleton className="h-4 w-64 mx-auto" />
              <Skeleton className="h-4 w-48 mx-auto" />
            </div>
          }
        >
          <UserProfileFooter userId={userId} />
        </Suspense>
      </div>
    </div>
  );
}

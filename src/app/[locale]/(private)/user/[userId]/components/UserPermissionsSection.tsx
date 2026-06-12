import { Badge } from "@/components/ui/badge";
import { getPermissionsMap, getPermissionInfo } from "@/constants/permissions";
import { MemberRole } from "@/generated/prisma/enums";
import { roleMapper } from "@/mappers/roleMapper";
import { Crown, Shield, ShieldAlert, ShieldCheck } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { getUserPermissionsProfile } from "../_data/getUserProfileSections";
import { UserProfileSectionCard } from "./UserProfileSectionCard";

interface UserPermissionsSectionProps {
  userId: string;
}

export async function UserPermissionsSection({
  userId,
}: UserPermissionsSectionProps) {
  const [profile, t, tPermissions] = await Promise.all([
    getUserPermissionsProfile(userId),
    getTranslations("userProfile.permissions"),
    getTranslations("permissions"),
  ]);

  const permissionsMap = getPermissionsMap((key) =>
    tPermissions(key as Parameters<typeof tPermissions>[0]),
  );

  const isAdmin = profile.memberRole === MemberRole.TENANT_ADMIN;
  const baseRoleLabel = profile.memberRole
    ? roleMapper[profile.memberRole]
    : null;

  return (
    <UserProfileSectionCard
      title={t("title")}
      icon={<Shield className="w-6 h-6 text-blue-600" />}
      collapsible
    >
      {!profile.organizationId && (
        <div className="bg-background/50 flex flex-col items-center justify-center p-8 rounded-xl border border-dashed text-center">
          <ShieldAlert className="w-6 h-6 text-muted-foreground mb-3" />
          <p className="text-muted-foreground font-medium">{t("noOrganization")}</p>
          <p className="text-sm text-slate-500 mt-1">{t("noOrganizationDesc")}</p>
        </div>
      )}

      {profile.organizationId && !profile.memberRole && (
        <div className="bg-background/50 flex flex-col items-center justify-center p-8 rounded-xl border border-dashed text-center">
          <ShieldAlert className="w-6 h-6 text-muted-foreground mb-3" />
          <p className="text-muted-foreground font-medium">{t("noMembership")}</p>
          <p className="text-sm text-slate-500 mt-1">{t("noMembershipDesc")}</p>
        </div>
      )}

      {profile.memberRole && (
        <div className="space-y-6">
          <div className="bg-background/70 p-4 rounded-xl border">
            <p className="text-xs text-muted-foreground uppercase font-bold mb-3">
              {t("rolesTitle")}
            </p>
            <div className="flex flex-wrap gap-2">
              {baseRoleLabel && (
                <Badge
                  variant={isAdmin ? "default" : "outline"}
                  className="gap-1"
                >
                  {isAdmin ? (
                    <Crown className="w-3 h-3" />
                  ) : (
                    <ShieldCheck className="w-3 h-3" />
                  )}
                  {baseRoleLabel}
                </Badge>
              )}
              {profile.customRoleId && profile.roleName && (
                <Badge variant="secondary" className="gap-1">
                  <Shield className="w-3 h-3" />
                  {t("customRole")}: {profile.roleName}
                </Badge>
              )}
              {!profile.customRoleId && profile.roleName && !baseRoleLabel && (
                <Badge variant="secondary">{profile.roleName}</Badge>
              )}
            </div>
          </div>

          {profile.allPermissions.length === 0 ? (
            <div className="bg-background/50 p-6 rounded-xl border text-center">
              <p className="text-muted-foreground font-medium">
                {t("noPermissions")}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{t("permissionsDesc")}</p>
              {permissionsMap.map((category) => {
                const activePermissions = category.permissions.filter((permission) =>
                  profile.allPermissions.includes(permission.key),
                );

                if (activePermissions.length === 0) return null;

                const CategoryIcon = category.icon;

                return (
                  <div
                    key={category.key}
                    className="bg-background/70 p-4 rounded-xl border space-y-3"
                  >
                    <div className="flex items-center gap-2">
                      <CategoryIcon className="w-4 h-4 text-primary" />
                      <p className="font-semibold">{category.label}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {activePermissions.map((permission) => {
                        const isSpecific =
                          profile.specificPermissions.includes(permission.key);
                        const info = getPermissionInfo(permission.key, (key) =>
                          tPermissions(
                            key as Parameters<typeof tPermissions>[0],
                          ),
                        );

                        return (
                          <Badge
                            key={permission.key}
                            variant={isSpecific ? "default" : "secondary"}
                            title={info.description}
                          >
                            {info.label}
                            {isSpecific && ` (${t("extra")})`}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </UserProfileSectionCard>
  );
}

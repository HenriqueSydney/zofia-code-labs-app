import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { SectionHeading } from "@/components/SectionHeading";
import { EmptyState } from "@/components/EmptyState";
import { loadClientMemberships } from "@/lib/auth/loadClientMemberships";
import { MemberRole } from "@/generated/prisma/enums";
import { getClientEmployeeRoleLabel } from "@/mappers/clientEmployeeRoleMapper";
import { getTranslations } from "next-intl/server";

export default async function MinhasEmpresasPage() {
  const t = await getTranslations("clientPortal.companies");
  const tRoles = await getTranslations("clients.roles");
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  const memberships = await loadClientMemberships(
    session.user.id,
    session.user.organizationId,
  );

  const activeMemberships = memberships.filter((m) => m.status === "ACTIVE");
  const pendingMemberships = memberships.filter((m) => m.status === "PENDING");

  return (
    <div className="space-y-6">
      <SectionHeading title={t("title")} description={t("description")} />

      {memberships.length === 0 && (
        <EmptyState
          icon={Building2}
          title={t("emptyTitle")}
          description={t("emptyDescription")}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeMemberships.map((membership) => (
          <Card
            key={membership.clientId}
            className="flex flex-col hover:shadow-lg transition-all"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      {membership.tradeName}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {membership.companyName}
                    </p>
                  </div>
                </div>
                <Badge variant="outline">
                  {getClientEmployeeRoleLabel(
                    membership.employeeRole,
                    tRoles,
                  )}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="mt-auto">
              <Link
                href={`/clients/${membership.clientSlug}/dashboard`}
                className="text-sm font-medium text-primary hover:underline"
              >
                {t("accessProjects")}
              </Link>
            </CardContent>
          </Card>
        ))}

        {pendingMemberships.map((membership) => (
          <Card key={membership.clientId} className="opacity-80 border-dashed">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                {membership.tradeName}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary">{t("pendingInvite")}</Badge>
              <p className="text-sm text-muted-foreground mt-2">
                {t("checkEmail")}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {session.user.memberRole === MemberRole.TENANT_OBSERVER && (
        <p className="text-xs text-muted-foreground">
          {t("profileLabel")}
        </p>
      )}
    </div>
  );
}

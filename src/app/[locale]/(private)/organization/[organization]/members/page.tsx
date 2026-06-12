import { EmptyState } from "@/components/EmptyState";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { operationWrapper } from "@/lib/operationWrapper";
import { Users, ShieldCheck, ShieldAlert, Crown } from "lucide-react";
import { date } from "@/lib/dayjs";
import { Tooltip } from "@/components/Tooltip";
import { UserAvatar } from "@/components/UserAvatar";
import { MemberActions } from "./_components/MemberActions"; // Ações específicas de membro
import { fetchOrganizationMembersAction } from "@/actions/organization/fetchOrganizationMembersAction";
import { InviteMemberForm } from "./_components/InviteMemberForm";
import { fetchOrganizationCustomRolesAction } from "@/actions/organization/fetchOrganizationCustomRolesAction";
import { roleMapper } from "@/mappers/roleMapper";
import { getPermissionInfo } from "@/constants/permissions";
import { getOrganizationUiAccess } from "../_data/getOrganizationUiAccess";
import { getTranslations } from "next-intl/server";

interface IOrganizationMembersPage {
  params: Promise<{ organization: string }>;
}
export default async function OrganizationMembers({
  params,
}: IOrganizationMembersPage) {
  const t = await getTranslations("organization.members");
  const tInvite = await getTranslations("organization.members.invite");
  const tPermissions = await getTranslations("permissions");
  const { organization } = await params;
  const { canManageMembers } = await getOrganizationUiAccess(organization);

  const [organizationMembers, customRoles] = await Promise.all([
    operationWrapper("action", "fetchOrganizationMembersAction", () =>
      fetchOrganizationMembersAction(organization),
    ),
    operationWrapper("action", "fetchOrganizationCustomRolesAction", () =>
      fetchOrganizationCustomRolesAction(organization),
    ),
  ]);

  const [error, success] = organizationMembers;
  const [_, customRolesSuccess] = customRoles;
  const customRolesList = customRolesSuccess?.roles ?? [];

  const inviteRoleOptions = [
    {
      label: tInvite("roles.adminDefault"),
      value: "admin",
    },
    {
      label: tInvite("roles.memberDefault"),
      value: "member",
    },
    ...customRolesList.map((role) => ({
      label: role.name,
      value: role.id,
    })),
  ];

  // Reaproveitamento do Empty State
  if (error || !success?.members || success.members.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title={t("emptyTitle")}
        description={t("emptyDescription")}
        action={
          canManageMembers ? (
            <InviteMemberForm
              orgId={organization}
              roleOptions={inviteRoleOptions}
            />
          ) : undefined
        }
      />
    );
  }

  const memberStatusMapper: Record<string, { label: string; color: string }> = {
    active: {
      label: t("table.statusActive"),
      color: "bg-green-500/10 text-green-600 border-green-200",
    },
    pending: {
      label: t("table.statusPending"),
      color: "bg-yellow-500/10 text-yellow-600",
    },
    deactivated: {
      label: t("table.statusRemoved"),
      color: "bg-red-500/10 text-red-600 border-red-200",
    },
  } as const;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t("table.title")}</CardTitle>
            <CardDescription>{t("table.description")}</CardDescription>
          </div>
          {canManageMembers && (
            <InviteMemberForm
              orgId={organization}
              roleOptions={inviteRoleOptions}
            />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("table.member")}</TableHead>
              <TableHead>{t("table.accessProfile")}</TableHead>
              <TableHead>{t("table.status")}</TableHead>
              <TableHead>{t("table.lastAccess")}</TableHead>
              {canManageMembers && (
                <TableHead className="text-right">
                  {t("table.actions")}
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {success.members.map((member) => {
              const lastLogin = member.loginHistories?.[0]?.createdAt;

              // Lógica de exibição de Roles (Híbrido System + Custom)

              const isAdmin = member.role === "TENANT_ADMIN";
              const roleName =
                member.customRole?.name || roleMapper[member.role];

              let memberStatusKey = "active";
              if (member.status === "PENDING") {
                memberStatusKey = "pending";
              }
              if (member.status === "INACTIVE" || member.removedAt) {
                memberStatusKey = "deactivated";
              }

              return (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <UserAvatar
                        image={member.image}
                        userName={member.name}
                        size="tiny"
                      />
                      <div>
                        <p className="font-medium flex items-center gap-2">
                          {member.name}
                          {isAdmin && (
                            <Tooltip description={t("table.accountOwner")}>
                              <Crown
                                size={14}
                                className="text-yellow-500 fill-yellow-500/20"
                              />
                            </Tooltip>
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {member.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    {/* Badge diferenciado para Owner/Admin vs Roles Customizados */}
                    <div className="flex flex-col items-start gap-1">
                      <Badge
                        variant={isAdmin ? "default" : "outline"}
                        className="gap-1"
                        title={isAdmin ? t("table.accountOwner") : undefined}
                      >
                        {isAdmin && <ShieldAlert size={12} />}
                        {!isAdmin && <ShieldCheck size={12} />}
                        {roleName}
                      </Badge>
                      {member.specificPermissions.length > 0 && (
                        <Tooltip
                          description={
                            <div className="flex flex-col gap-2">
                              <label className="font-bold">
                                {t("table.specificPermissions")}
                              </label>
                              <ul className="list-disc ml-2">
                                {member.specificPermissions.map(
                                  (permission) => (
                                    <li key={permission}>
                                      <strong>
                                        {
                                          getPermissionInfo(permission, (key) =>
                                            tPermissions(
                                              key as Parameters<
                                                typeof tPermissions
                                              >[0],
                                            ),
                                          ).label
                                        }{" "}
                                      </strong>
                                      ({permission})
                                    </li>
                                  ),
                                )}
                              </ul>
                            </div>
                          }
                        >
                          <span className="ml-2 text-sm text-muted-foreground">
                            {t("table.extraPermissions", {
                              count: member.specificPermissions.length,
                            })}
                          </span>
                        </Tooltip>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    {/* Exemplo de status baseado em verificação de email ou convite */}
                    <Badge
                      variant={member.emailVerified ? "outline" : "secondary"}
                      className={memberStatusMapper[memberStatusKey].color}
                    >
                      {memberStatusMapper[memberStatusKey].label}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-muted-foreground text-sm">
                    {lastLogin ? (
                      date(lastLogin).format("DD/MM/YYYY HH:mm")
                    ) : (
                      <span className="text-muted-foreground/50 text-xs italic">
                        {t("table.neverAccessed")}
                      </span>
                    )}
                  </TableCell>

                  {canManageMembers && (
                    <TableCell className="text-right">
                      <MemberActions
                        orgId={organization}
                        member={member}
                        customRolesList={customRolesList}
                        canManage={canManageMembers}
                      />
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

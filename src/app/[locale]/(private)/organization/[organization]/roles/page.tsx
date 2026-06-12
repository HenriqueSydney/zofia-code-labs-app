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
import { ShieldCheck } from "lucide-react";
import { RoleFormDialog } from "./_components/RoleFormDialog";
import { DeleteRoleDialog } from "./_components/DeleteRoleDialog"; // Modal de deleção (simples)
import { fetchOrganizationCustomRolesAction } from "@/actions/organization/fetchOrganizationCustomRolesAction";
import { getOrganizationUiAccess } from "../_data/getOrganizationUiAccess";
import { getTranslations } from "next-intl/server";

interface IOrganizationRoles {
  params: Promise<{ organization: string }>;
}

export default async function OrganizationRoles({
  params,
}: IOrganizationRoles) {
  const t = await getTranslations("organization.roles");
  const tCommon = await getTranslations("common");
  const { organization } = await params;
  const { canManageMembers } = await getOrganizationUiAccess(organization);

  const [error, success] = await operationWrapper("action", "getRoles", () =>
    fetchOrganizationCustomRolesAction(organization),
  );

  const roles = success?.roles || [];

  if (error || roles.length === 0) {
    return (
      <EmptyState
        icon={ShieldCheck}
        title={t("emptyTitle")}
        description={t("emptyDescription")}
        action={
          canManageMembers ? (
            <RoleFormDialog orgId={organization} canManage={canManageMembers} />
          ) : undefined
        }
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t("table.title")}</CardTitle>
            <CardDescription>{t("table.description")}</CardDescription>
          </div>
          <RoleFormDialog orgId={organization} canManage={canManageMembers} />
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("table.profileName")}</TableHead>
              <TableHead>{t("table.members")}</TableHead>
              <TableHead>{t("table.enabledPermissions")}</TableHead>
              <TableHead className="text-right">{t("table.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.map((role) => (
              <TableRow key={role.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{role.name}</p>
                    <p className="text-sm text-muted-foreground truncate max-w-[300px]">
                      {role.description || tCommon("noDescription")}
                    </p>
                  </div>
                </TableCell>

                <TableCell>
                  <Badge variant="secondary">
                    {t("table.memberCount", {
                      count: role._count?.members || 0,
                    })}
                  </Badge>
                </TableCell>

                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="outline" className="text-xs">
                      {t("table.permissionCount", {
                        count: role.permissions.length,
                      })}
                    </Badge>

                    {/* 1. Extraímos apenas os prefixos (grupos) únicos */}
                    {Array.from(
                      new Set(
                        role.permissions.map((p: string) => p.split(":")[0]),
                      ),
                    )
                      .slice(0, 2) // 2. Agora o slice pega 2 grupos diferentes
                      .map((group) => (
                        <Badge
                          key={group}
                          variant="outline"
                          className="text-xs bg-muted text-muted-foreground font-normal border-transparent"
                        >
                          {group}
                        </Badge>
                      ))}

                    {/* Ajuste na lógica do "..." para refletir se há mais grupos além dos 2 exibidos */}
                    {new Set(
                      role.permissions.map((p: string) => p.split(":")[0]),
                    ).size > 2 && (
                      <span className="text-xs text-muted-foreground py-1 px-2">
                        ...
                      </span>
                    )}
                  </div>
                </TableCell>

                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    {/* Botão de Edição */}
                    <RoleFormDialog
                      orgId={organization}
                      roleToEdit={role}
                      canManage={canManageMembers}
                    />

                    {/* Botão de Exclusão */}
                    <DeleteRoleDialog
                      roleId={role.id}
                      roleName={role.name}
                      disabled={role._count?.members > 0}
                      canManage={canManageMembers}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

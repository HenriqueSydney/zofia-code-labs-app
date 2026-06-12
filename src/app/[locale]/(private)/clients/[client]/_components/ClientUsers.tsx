import { fetchClientEmployeesAction } from "@/actions/clients/fetchClientEmployeesAction";
import { EmptyState } from "@/components/EmptyState";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { MoreHorizontal, Users } from "lucide-react";
import { ClientEmployeeCreateForm } from "./ClientEmployeeCreateForm";
import { date } from "@/lib/dayjs";
import { Tooltip } from "@/components/Tooltip";
import { getClientEmployeeRoleLabel } from "@/mappers/clientEmployeeRoleMapper";
import { getTranslations } from "next-intl/server";
import { UserAvatar } from "@/components/UserAvatar";
import { ClientEmployeeActions } from "./ClientEmployeeActions";

interface IClientUsers {
  clientSlug: string;
}

export async function ClientUsers({ clientSlug }: IClientUsers) {
  const t = await getTranslations("clients.users");
  const tRoles = await getTranslations("clients.roles");
  const tCommon = await getTranslations("common");
  const [error, success] = await operationWrapper("action", "getClient", () =>
    fetchClientEmployeesAction(clientSlug)
  );

  if (error) {
    return (
      <EmptyState
        icon={Users}
        title={t("emptyTitle")}
        description={t("emptyDescription")}
        action={<ClientEmployeeCreateForm clientSlug={clientSlug} />}
      />
    );
  }

  if (success.employees.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title={t("emptyTitle")}
        description={t("emptyDescription")}
        action={<ClientEmployeeCreateForm clientSlug={clientSlug} />}
      />
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "inactive":
        return "bg-muted text-muted-foreground";
      case "pending":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "open":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "in_progress":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "resolved":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t("title")}</CardTitle>
            <CardDescription>{t("description")}</CardDescription>
          </div>
          <ClientEmployeeCreateForm clientSlug={clientSlug} />
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("columns.user")}</TableHead>
              <TableHead>{t("columns.role")}</TableHead>
              <TableHead>{t("columns.permission")}</TableHead>
              <TableHead>{t("columns.status")}</TableHead>
              <TableHead>{t("columns.lastAccess")}</TableHead>
              <TableHead className="text-right">
                {tCommon("actions.label")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {success.employees.map((employee) => {
              const lastLogin = employee.user.loginHistories[0]?.createdAt;

              return (
                <TableRow key={employee.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <UserAvatar
                        image={employee.user.image}
                        userName={employee.user.name}
                        size="small"
                      />
                      <div>
                        <p className="font-medium">{employee.user.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {employee.user.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{employee.jobTitle}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {employee.permissionRole
                        ? getClientEmployeeRoleLabel(
                            employee.permissionRole,
                            tRoles,
                          )
                        : t("defaultRole")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(employee.status)}>
                      {employee.status === "ACTIVE"
                        ? t("status.ACTIVE")
                        : employee.status === "PENDING"
                          ? t("status.PENDING")
                          : t("status.INACTIVE")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {lastLogin && date(lastLogin).format("DD/MM/YYYY HH:mm")}
                    {!lastLogin && (
                      <Tooltip description={t("noLoginYet")}>
                        <span>-----</span>
                      </Tooltip>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <ClientEmployeeActions
                      clientSlug={clientSlug}
                      employee={employee}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

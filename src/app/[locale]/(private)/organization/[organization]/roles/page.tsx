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

interface IOrganizationRoles {
  params: Promise<{ organization: string }>;
}

export default async function OrganizationRoles({
  params,
}: IOrganizationRoles) {
  const { organization } = await params;

  const [error, success] = await operationWrapper("action", "getRoles", () =>
    fetchOrganizationCustomRolesAction(organization),
  );

  const roles = success?.roles || [];

  if (error || roles.length === 0) {
    return (
      <EmptyState
        icon={ShieldCheck}
        title="Nenhum perfil de acesso criado"
        description="Crie perfis personalizados (ex: Gerente, Financeiro) para controlar o que cada membro pode fazer."
        action={<RoleFormDialog orgId={organization} />}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Perfis de Acesso</CardTitle>
            <CardDescription>
              Defina conjuntos de permissões reutilizáveis para sua equipe.
            </CardDescription>
          </div>
          <RoleFormDialog orgId={organization} />
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome do Perfil</TableHead>
              <TableHead>Membros</TableHead>
              <TableHead>Permissões Habilitadas</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.map((role) => (
              <TableRow key={role.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{role.name}</p>
                    <p className="text-sm text-muted-foreground truncate max-w-[300px]">
                      {role.description || "Sem descrição"}
                    </p>
                  </div>
                </TableCell>

                <TableCell>
                  <Badge variant="secondary">
                    {role._count?.members || 0} usuários
                  </Badge>
                </TableCell>

                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="outline" className="text-xs">
                      {role.permissions.length} permissões
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
                    <RoleFormDialog orgId={organization} roleToEdit={role} />

                    {/* Botão de Exclusão */}
                    <DeleteRoleDialog
                      roleId={role.id}
                      roleName={role.name}
                      disabled={role._count?.members > 0}
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

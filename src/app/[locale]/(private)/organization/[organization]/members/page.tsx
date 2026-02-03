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

interface IOrganizationMembersPage {
  params: Promise<{ organization: string }>;
}
export default async function OrganizationMembers({
  params,
}: IOrganizationMembersPage) {
  const { organization } = await params;
  // Action que busca users where organizationId = orgId, include { customRole: true }
  const [error, success] = await operationWrapper(
    "action",
    "fetchOrganizationMembersAction",
    () => fetchOrganizationMembersAction(organization),
  );

  // Reaproveitamento do Empty State
  if (error || !success?.members || success.members.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="Sua equipe está vazia"
        description="Adicione membros à sua organização para colaborar nos projetos."
        action={<InviteMemberForm orgId={organization} />}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Membros da Equipe</CardTitle>
            <CardDescription>
              Gerencie quem tem acesso à sua organização e seus níveis de
              permissão.
            </CardDescription>
          </div>
          <InviteMemberForm orgId={organization} />
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Membro</TableHead>
              <TableHead>Perfil de Acesso</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Último Acesso</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {success.members.map((user) => {
              const lastLogin = user.loginHistories?.[0]?.createdAt;

              // Lógica de exibição de Roles (Híbrido System + Custom)
              const isOwner = user.role === "OWNER";
              const isAdmin = user.role === "TENANT_ADMIN";
              const roleName =
                user.customRole?.name || (isAdmin ? "Administrador" : "Membro");

              return (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <UserAvatar
                        image={user.image}
                        userName={user.name}
                        size="tiny"
                      />
                      <div>
                        <p className="font-medium flex items-center gap-2">
                          {user.name}
                          {isOwner && (
                            <Tooltip description="Dono da Conta">
                              <Crown
                                size={14}
                                className="text-yellow-500 fill-yellow-500/20"
                              />
                            </Tooltip>
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    {/* Badge diferenciado para Owner/Admin vs Roles Customizados */}
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={isOwner || isAdmin ? "default" : "outline"}
                        className="gap-1"
                      >
                        {isOwner || isAdmin ? (
                          <ShieldAlert size={12} />
                        ) : (
                          <ShieldCheck size={12} />
                        )}
                        {isOwner ? "Owner" : roleName}
                      </Badge>
                    </div>
                  </TableCell>

                  <TableCell>
                    {/* Exemplo de status baseado em verificação de email ou convite */}
                    <Badge
                      variant={user.emailVerified ? "outline" : "secondary"}
                      className={
                        user.emailVerified
                          ? "bg-green-500/10 text-green-600 border-green-200"
                          : "bg-yellow-500/10 text-yellow-600"
                      }
                    >
                      {user.emailVerified ? "Ativo" : "Pendente"}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-muted-foreground text-sm">
                    {lastLogin ? (
                      date(lastLogin).format("DD/MM/YYYY HH:mm")
                    ) : (
                      <span className="text-muted-foreground/50 text-xs italic">
                        Nunca acessou
                      </span>
                    )}
                  </TableCell>

                  <TableCell className="text-right">
                    {/* Bloqueia ações no Owner para evitar que se delete a si mesmo acidentalmente aqui */}
                    {!isOwner && (
                      <MemberActions orgId={organization} member={user} />
                    )}
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

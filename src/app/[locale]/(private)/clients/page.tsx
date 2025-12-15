import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Mail, Phone } from "lucide-react"; // Ícones atualizados

import { SectionHeading } from "@/components/SectionHeading";
import { CreateClientForm } from "./components/CreateClientForm";
import { EmptyState } from "@/components/EmptyState";
import { getParams } from "@/utils/getParams";
import { operationWrapper } from "@/lib/operationWrapper";
import { ClientRemoveOrEdit } from "./components/ClientRemoveOrEdit";
import { fetchClientsAction } from "@/actions/clients/fetchClientsAction";
import { QueryFilter } from "@/components/QueryFilter";

interface IParams {
  searchParams?: Promise<{ [key: string]: string | undefined }>;
}

const Clients = async ({ searchParams }: IParams) => {
  const { query } = await getParams(searchParams, ["query"]);

  const [clientsError, clientsSuccess] = await operationWrapper(
    "action",
    "fetchClientsAction",
    () => {
      return fetchClientsAction(query);
    },
    {
      cache: "no-cache",
    }
  );

  const clients = clientsError ? [] : clientsSuccess.clients;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        {/* Título Ajustado para o contexto de Clientes */}
        <SectionHeading
          title="Carteira de Clientes"
          description="Gerencie as empresas e contatos cadastrados"
        />
        <CreateClientForm />
      </div>

      <QueryFilter placeholder="Buscar cliente..." />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clients.map((client) => (
          <Card
            key={client.id}
            // h-full garante que todos tenham a mesma altura na linha se usar grid items stretch
            // hover:scale-[1.02] é mais suave que 101 (que não existe por padrão no tailwind, a menos que customizado)
            className="flex flex-col hover:shadow-lg hover:scale-[1.02] transition-all"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div className="overflow-hidden">
                    <CardTitle
                      className="text-lg truncate"
                      title={client.companyName}
                    >
                      {client.companyName}
                    </CardTitle>
                    {client.cnpj && (
                      <Badge
                        variant="secondary"
                        className="mt-1 text-xs font-normal"
                      >
                        {client.cnpj}
                      </Badge>
                    )}
                  </div>
                </div>
                {client.deletedAt && (
                  <Badge
                    variant="destructive"
                    className="mt-1 text-xs font-medium"
                  >
                    Inativo
                  </Badge>
                )}
                {!client.deletedAt && <ClientRemoveOrEdit client={client} />}
              </div>
            </CardHeader>

            <CardContent className="flex flex-1 flex-col gap-4">
              {/* Exibe Nome Fantasia se existir e for diferente da Razão Social */}
              {client.tradeName && client.tradeName !== client.companyName && (
                <div className="text-sm font-medium text-foreground/80">
                  <span className="text-muted-foreground font-normal">
                    Fantasia:{" "}
                  </span>
                  {client.tradeName}
                </div>
              )}

              <div className="mt-auto space-y-2 pt-2 border-t">
                {/* E-mail */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground truncate">
                  <Mail className="h-4 w-4 shrink-0" />
                  <span
                    className="truncate"
                    title={client.email || "Sem e-mail"}
                  >
                    {client.email || "Sem e-mail cadastrado"}
                  </span>
                </div>

                {/* Telefone */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4 shrink-0" />
                  <span>{client.phone || "Sem telefone cadastrado"}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {clients.length === 0 && <EmptyState title="Nenhum cliente localizado" />}
    </div>
  );
};

export default Clients;

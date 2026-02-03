import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Mail, Phone } from "lucide-react"; // Ícones atualizados

import { SectionHeading } from "@/components/SectionHeading";
import { CreateClientForm } from "./_components/CreateClientForm";
import { EmptyState } from "@/components/EmptyState";
import { getParams } from "@/utils/getParams";
import { operationWrapper } from "@/lib/operationWrapper";
import { ClientRemoveOrEdit } from "./_components/ClientRemoveOrEdit";
import { fetchClientsAction } from "@/actions/clients/fetchClientsAction";
import { QueryFilter } from "@/components/QueryFilter";
import { makeS3StorageService } from "@/services/s3Client/makeS3StorageService";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "@/i18n/navigation";
import { mask } from "@/utils/mask";

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
    },
  );

  const rawClients = clientsError ? [] : clientsSuccess.clients;

  const storageService = makeS3StorageService();
  const clientsWithLogos = await Promise.all(
    rawClients.map(async (client) => {
      if (client.logoReference) {
        try {
          const signedUrl = await storageService.getSignedUrl(
            client.logoReference,
            3600,
          ); // expira em 1h
          return { ...client, logoUrl: signedUrl };
        } catch (error) {
          console.error("Erro ao gerar URL para", client.companyName, error);
          return { ...client, logoUrl: null };
        }
      }
      return { ...client, logoUrl: null };
    }),
  );

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
        {clientsWithLogos.map((client) => {
          return (
            <Card
              key={client.id}
              // h-full garante que todos tenham a mesma altura na linha se usar grid items stretch
              // hover:scale-[1.02] é mais suave que 101 (que não existe por padrão no tailwind, a menos que customizado)
              className="flex flex-col hover:shadow-lg hover:scale-[1.02] transition-all"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <Link href={`/clients/${client.slug}`}>
                    <div className="flex items-center gap-3 overflow-hidden hover:underline">
                      <div className="shrink-0">
                        <Avatar className="h-16 w-24 rounded-lg border">
                          <AvatarImage
                            src={client.logoUrl ?? undefined}
                            alt={`Logo da empresa ${client.companyName}`}
                            className="object-fit p-1 rounded-md"
                          />
                          <AvatarFallback className="bg-primary/5 flex flex-col items-center justify-center gap-1">
                            {/* Aumentamos o ícone para h-8 w-8 para acompanhar o card maior */}
                            <Building2 className="h-8 w-8 text-primary/40" />
                            <span className="text-[10px] text-primary/80 font-medium uppercase">
                              {client.companyName.substring(0, 2)}
                            </span>
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="overflow-hidden">
                        <CardTitle
                          className="text-lg truncate"
                          title={client.tradeName}
                        >
                          {client.tradeName}
                        </CardTitle>
                        {client.cnpj && (
                          <Badge
                            variant="secondary"
                            className="mt-1 text-xs font-normal"
                          >
                            {client.cnpj.includes("/")
                              ? client.cnpj
                              : mask(client.cnpj, "##.###.###/####-##")}
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
                  </Link>
                  {!client.deletedAt && <ClientRemoveOrEdit client={client} />}
                </div>
              </CardHeader>

              <CardContent className="flex flex-1 flex-col gap-4">
                {/* Exibe Nome Fantasia se existir e for diferente da Razão Social */}
                {client.tradeName &&
                  client.tradeName !== client.companyName && (
                    <div className="text-sm font-medium text-foreground/80">
                      <span className="text-muted-foreground font-normal">
                        Nome da empresa:
                      </span>{" "}
                      {client.companyName}
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
          );
        })}
      </div>

      {clientsWithLogos.length === 0 && (
        <EmptyState
          icon={Building2}
          title="Nenhum cliente localizado"
          description="Cadastre o primeiro cliente para que possa iniciar a realização de projetos"
        />
      )}
    </div>
  );
};

export default Clients;

import { Card, CardContent } from "@/components/ui/card";
import { Key } from "lucide-react";
import { IntegrationCard } from "./components/IntegrationCard";
import { SectionHeading } from "@/components/SectionHeading";
import { QueryFilter } from "@/components/QueryFilter";
import { operationWrapper } from "@/lib/operationWrapper";
import { listIntegrationTypesAction } from "@/actions/integrations/listIntegrationTypesAction";
import { getParams } from "@/utils/getParams";
import { AppError } from "@/errors/AppError";
import { listOrganizationIntegrationsAction } from "@/actions/integrations/listOrganizationIntegrationsAction";
import { date } from "@/lib/dayjs";

export interface Integration {
  id: string;
  orgIntegrationId?: string;
  name: string;
  description: string;
  logo: string;
  isConnected: boolean;
  apiKey?: string;
  lastSync?: string;
  externalDocsUrl?: string | null;
  fieldsSchema: Array<{ key: string; label: string }>;
  isHealth: boolean;
  intergrationData: any;
}

interface IParams {
  searchParams?: Promise<{ [key: string]: string | undefined }>;
}
const Integrations = async ({ searchParams }: IParams) => {
  const { query } = await getParams(searchParams, ["query"]);

  const [integrationTypeResponse, orgIntegrationResponse] = await Promise.all([
    operationWrapper(
      "action",
      "listIntegrationTypesAction",
      () => {
        return listIntegrationTypesAction(query);
      },
      {
        cache: "no-cache",
      }
    ),
    operationWrapper(
      "action",
      "listIntegrationTypesAction",
      () => {
        return listOrganizationIntegrationsAction();
      },
      {
        cache: "no-cache",
      }
    ),
  ]);

  const [error, success] = integrationTypeResponse;

  if (error) {
    throw new AppError("Erro ao listar os tipos de integração possíveis");
  }

  const [organizationIntegrationError, organizationIntegrationSuccess] =
    orgIntegrationResponse;

  if (organizationIntegrationError) {
    throw new AppError("Erro ao identificar as integrações da organização");
  }

  const integrations: Integration[] = success.data.map((integration) => {
    const intergrationConfig = organizationIntegrationSuccess.data.find(
      (config) => config.integrationTypeId === integration.id
    );
    console.log(intergrationConfig);

    return {
      id: integration.id,
      name: integration.name,
      description: integration.description ?? "",
      isConnected: intergrationConfig?.enabled ?? false,
      apiKey: "",
      logo: integration.logo ?? "/zofia-logo.webp",
      lastSync: intergrationConfig?.lastHealthCheck
        ? date(intergrationConfig.lastHealthCheck).format("DD/MM/YYYY HH:mm")
        : undefined,
      externalDocsUrl: integration.externalDocsUrl,
      fieldsSchema: (integration.fieldsSchema as any) ?? [],
      isHealth: intergrationConfig?.healthStatus === "HEALTHY",
      intergrationData: intergrationConfig?.config,
      orgIntegrationId: intergrationConfig?.id,
    };
  });

  return (
    <div className="space-y-6">
      <SectionHeading
        title="Integrações"
        description="Configure chaves de API e conexões externas"
      />

      <QueryFilter placeholder="Buscar integração..." />

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {integrations.map((integration) => (
          <IntegrationCard key={integration.id} integration={integration} />
        ))}
      </div>

      {/* Info Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <Key className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Segurança das Chaves de API</h3>
              <p className="text-sm text-muted-foreground">
                Suas chaves de API são armazenadas de forma segura e
                criptografada. Nunca compartilhe suas chaves com terceiros. Para
                revogar o acesso, basta desconectar a integração ou gerar uma
                nova chave no painel do serviço.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Integrations;

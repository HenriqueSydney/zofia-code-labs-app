import { Card, CardContent } from "@/components/ui/card";
import { Key } from "lucide-react";
import { IntegrationCard } from "./components/IntegrationCard";
import { SectionHeading } from "@/components/SectionHeading";
import { QueryFilter } from "@/components/QueryFilter";
import { operationWrapper } from "@/lib/operationWrapper";
import { listIntegrationTypesAction } from "@/actions/integrations/listIntegrationTypesAction";
import { getParams } from "@/utils/getParams";
import { ValidationError } from "@/errors";
import { listOrganizationIntegrationsAction } from "@/actions/integrations/listOrganizationIntegrationsAction";
import { date } from "@/lib/dayjs";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { hasPermission } from "@/utils/hasPermission";
import { PERMISSIONS } from "@/constants/permissions";
import {
  IntegrationFieldSchema,
  normalizeIntegrationFieldSchema,
} from "@/schemas/integration/integrationType";

export interface Integration {
  id: string;
  orgIntegrationId?: string;
  name: string;
  description: string;
  enableByol: boolean;
  logo: string;
  isConnected: boolean;
  apiKey?: string;
  lastSync?: string;
  externalDocsUrl?: string | null;
  fieldsSchema: IntegrationFieldSchema[];
  isHealth: boolean;
  intergrationData: any;
  orgIntegrationByol: boolean;
}

interface IParams {
  searchParams?: Promise<{ [key: string]: string | undefined }>;
}
const Integrations = async ({ searchParams }: IParams) => {
  const { query } = await getParams(searchParams, ["query"]);

  const [integrationTypeResponse, orgIntegrationResponse, t, session] =
    await Promise.all([
      operationWrapper(
        "action",
        "listIntegrationTypesAction",
        () => {
          return listIntegrationTypesAction(query);
        },
        {
          cache: "no-cache",
        },
      ),
      operationWrapper(
        "action",
        "listIntegrationTypesAction",
        () => {
          return listOrganizationIntegrationsAction();
        },
        {
          cache: "no-cache",
        },
      ),
      getTranslations("settings.integrations.config"),
      auth(),
    ]);

  const [error, success] = integrationTypeResponse;

  if (error) {
    throw new ValidationError(error.message || t("errors.listTypesFailed"));
  }

  const [organizationIntegrationError, organizationIntegrationSuccess] =
    orgIntegrationResponse;

  if (organizationIntegrationError) {
    throw new ValidationError(
      organizationIntegrationError.message || t("errors.identifyFailed"),
    );
  }

  const integrations: Integration[] = success.data.map((integration) => {
    const intergrationConfig = organizationIntegrationSuccess.data.find(
      (config) => config.integrationTypeId === integration.id,
    );
    return {
      id: integration.id,
      name: integration.name,
      description: integration.description ?? "",
      isConnected: intergrationConfig?.enabled ?? false,
      enableByol: integration.enableByol,
      apiKey: "",
      logo: integration.logo ?? "",
      lastSync: intergrationConfig?.lastHealthCheck
        ? date(intergrationConfig.lastHealthCheck).format("DD/MM/YYYY HH:mm")
        : undefined,
      externalDocsUrl: integration.externalDocsUrl,
      fieldsSchema: ((integration.fieldsSchema as any[]) ?? []).map(
        normalizeIntegrationFieldSchema,
      ),
      isHealth: intergrationConfig?.healthStatus === "HEALTHY",
      intergrationData: intergrationConfig?.config,
      orgIntegrationId: intergrationConfig?.id,
      orgIntegrationByol: intergrationConfig?.enableByol ?? false,
    };
  });

  const canManage = hasPermission(session?.user, PERMISSIONS.SETTINGS.MANAGE_INTEGRATIONS);

  return (
    <div className="space-y-6">
      <SectionHeading title={t("title")} description={t("description")} />

      <QueryFilter placeholder={t("search")} />

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {integrations.map((integration) => (
          <IntegrationCard key={integration.id} integration={integration} canManage={canManage} />
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

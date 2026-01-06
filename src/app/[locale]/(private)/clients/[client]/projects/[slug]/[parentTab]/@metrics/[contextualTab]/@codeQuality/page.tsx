import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SuccessToastComponent } from "@/components/SuccessToastComponent";
import { getParams } from "@/utils/getParams";
import { TabsContent } from "@/components/ui/tabs";
import { operationWrapper } from "@/lib/operationWrapper";
import { OrganizationIntegrationWithDetails } from "@/repositories/IOrganizationIntegrationRepository";
import { findOrganizationIntegrationByIntegrationSlugAction } from "@/actions/integrations/findOrganizationIntegrationByIntegrationSlugAction";
import { AppError } from "@/errors/AppError";
import { CTAIntegration } from "../components/CTAIntegration";
import { IntegrationType } from "@/generated/prisma/client";
import { findIntegrationTypeBySlugAction } from "@/actions/integrations/findIntegrationTypeBySlugAction";
import { getSonarQubeMetricsAction } from "@/actions/integrations/getSonarQubeMetricsAction";
import { SyncSonarQubeMetrics } from "./components/SyncSonarQubeMetrics";
import { MetricsGrid } from "./components/MetricsGrid";
import { SeverityDonutChart } from "./components/SeverityDonutChart";
import { getSonarQubeHistoryAction } from "@/actions/integrations/getSonarQubeHistoryAction";
import { IssueEvolutionChart } from "./components/IssueEvolutionChart";
import { CoverageLineChart } from "./components/CoverageLineChart";
import { TechnicalDebtBarChart } from "./components/TechnicalDebtBarChart";
import { getSonarQubeIssueAndQualityGateAction } from "@/actions/integrations/getSonarQubeIssueAndQualityGateAction";
import { ProjectLiveDetails } from "./components/ProjectLiveDetails";
import { QualityStatusHeader } from "./components/QualityStatusHeader";

interface IParams {
  params: Promise<{
    client: string;
    slug: string;
    contextualTab: string;
  }>;
}

export default async function CodeQualityTab({ params }: IParams) {
  const { slug, client } = await getParams<{
    slug: string;
    client: string;
  }>(params, ["slug", "client"]);

  const [orgIntegration, integrationType] = await Promise.all([
    operationWrapper<{
      data: OrganizationIntegrationWithDetails | null;
    }>(
      "action",
      "findOrganizationIntegrationByIntegrationSlugAction",
      () => {
        return findOrganizationIntegrationByIntegrationSlugAction("sonarqube");
      },
      {
        cache: "no-cache",
      }
    ),
    operationWrapper<{
      data: IntegrationType | null;
    }>(
      "action",
      "findIntegrationTypeBySlugAction",
      () => {
        return findIntegrationTypeBySlugAction("sonarqube");
      },
      {
        cache: "no-cache",
      }
    ),
  ]);

  const [error, success] = orgIntegration;

  if (error) {
    throw new AppError("Erro ao tentar localizar os dados para integração");
  }

  const [integrationTypeError, integrationTypeSuccess] = integrationType;

  if (integrationTypeError) {
    throw new AppError(
      "Tipo de integração não configurada globalmente, entre em contato com o suporte"
    );
  }

  if (!integrationTypeSuccess.data) {
    throw new AppError(
      "Tipo de integração não configurada globalmente, entre em contato com o suporte"
    );
  }

  const doesProjectIsAlreadySetup = success.data
    ? success.data.projectIntegrations.findIndex(
        (integration) => integration.project.slug === slug
      )
    : -1;

  if (doesProjectIsAlreadySetup === -1) {
    return (
      <TabsContent value="code-quality" className="mt-6">
        <SuccessToastComponent />
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Code Quality</CardTitle>
          </CardHeader>
          <CardContent>
            {doesProjectIsAlreadySetup === -1 && (
              <CTAIntegration
                client={client}
                projectSlug={slug}
                integration={success.data}
                integrationType={integrationTypeSuccess.data}
              />
            )}
          </CardContent>
        </Card>
      </TabsContent>
    );
  }

  const [metricsError, metricsSuccess] = await operationWrapper<{
    success: boolean;
    data?: any; // Opcional para lidar com o caso de erro da Action
    message?: string;
  }>(
    "action",
    "getSonarQubeMetricsAction",
    () => {
      return getSonarQubeMetricsAction(slug);
    },
    {
      cache: "no-cache",
    }
  );

  if (metricsError) {
    throw new AppError("Não foi possível recuperar a métricas");
  }

  if (!metricsSuccess?.data) {
    throw new AppError("Não foi possível recuperar a métricas");
  }

  const metrics = metricsSuccess?.data?.metrics;

  const [historyError, historySuccess] = await operationWrapper<{
    success: boolean;
    data?: any;
    message?: string;
  }>(
    "action",
    "getSonarQubeHistoryAction",
    () => {
      return getSonarQubeHistoryAction(slug);
    },
    {
      cache: "no-cache",
    }
  );

  if (historyError) {
    throw new AppError("Não foi possível recuperar a métricas históricas");
  }

  const [issuesAndQualityGateError, issuesAndQualityGateSuccess] =
    await operationWrapper<{
      success: boolean;
      data?: any;
      message?: string;
    }>(
      "action",
      "getSonarQubeIssueAndQualityGateAction",
      () => {
        return getSonarQubeIssueAndQualityGateAction(slug);
      },
      {
        cache: "no-cache",
      }
    );

  if (issuesAndQualityGateError) {
    throw new AppError("Não foi possível recuperar a métricas históricas");
  }

  return (
    <TabsContent value="code-quality" className="mt-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Qualidade de código</CardTitle>
            <CardDescription>
              Acompanhe a qualidade do código do projeto. Informações coletadas
              do SonarQube
            </CardDescription>
          </div>
          <div className="flex items-end gap-6">
            <QualityStatusHeader
              status={metrics.status}
              rating={metrics.securityRating}
            />
            <SyncSonarQubeMetrics projectSlug={slug} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <MetricsGrid metrics={metrics} />

          {/* Linha de Gráficos */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            {historySuccess?.data && (
              <div className="lg:col-span-4">
                <IssueEvolutionChart data={historySuccess.data} />
              </div>
            )}

            <div className="lg:col-span-3">
              <SeverityDonutChart data={metrics.severity} />
            </div>
          </div>

          {historySuccess?.data && (
            <div className="grid gap-4 md:grid-cols-2">
              <CoverageLineChart data={historySuccess.data} />
              <TechnicalDebtBarChart data={historySuccess.data} />
            </div>
          )}

          {issuesAndQualityGateSuccess.data && (
            <ProjectLiveDetails
              issues={issuesAndQualityGateSuccess.data.issues}
              qualityGate={issuesAndQualityGateSuccess.data.qualityGate}
            />
          )}
        </CardContent>
      </Card>
    </TabsContent>
  );
}

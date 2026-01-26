import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getParams } from "@/utils/getParams";
import { TabsContent } from "@/components/ui/tabs";
import { CTAIntegration } from "../components/CTAIntegration";
import { AppError } from "@/errors/AppError";
import { findIntegrationTypeBySlugAction } from "@/actions/integrations/findIntegrationTypeBySlugAction";
import { operationWrapper } from "@/lib/operationWrapper";
import { IntegrationType } from "@/generated/prisma/client";
import { OrganizationIntegrationWithDetails } from "@/repositories/IOrganizationIntegrationRepository";
import { findOrganizationIntegrationByIntegrationSlugAction } from "@/actions/integrations/findOrganizationIntegrationByIntegrationSlugAction";
import { SyncUmamiMetrics } from "./_components/SyncUmamiMetrics";
import { Suspense } from "react";
import { SummaryCardsSkeleton } from "./_skeletons/SummaryCardsSkeleton";
import { MetricsGrid } from "./_components/MetricsGrid";
import { ChartsContainer } from "./_components/ChartsContainer";
import { LineChartSkeleton } from "@/components/skeletons/LineChartSkeleton";
import { BarChartSkeleton } from "@/components/skeletons/BarChartSkeleton";
import { DeviceAndSoChartsContainer } from "./_components/DeviceAndSoChartsContainer";
import { RealTimeChart } from "./_components/RealTimeChart";
import { IssuesTableSkeleton } from "../@codeQuality/_skeletons/IssuesTableSkeleton";
import { ListsContainer } from "./_components/ListsContainer";

interface IContractTab {
  params: Promise<{
    slug: string;
    contextualTab: string;
    page?: number;
    numberPerPage?: number;
  }>;
}

export default async function ContractTab({ params }: IContractTab) {
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
        return findOrganizationIntegrationByIntegrationSlugAction(
          "umami-analytics",
        );
      },
      {
        cache: "no-cache",
      },
    ),
    operationWrapper<{
      data: IntegrationType | null;
    }>(
      "action",
      "findIntegrationTypeBySlugAction",
      () => {
        return findIntegrationTypeBySlugAction("umami-analytics");
      },
      {
        cache: "no-cache",
      },
    ),
  ]);

  const [error, success] = orgIntegration;

  if (error) {
    throw new AppError("Erro ao tentar localizar os dados para integração");
  }

  const [integrationTypeError, integrationTypeSuccess] = integrationType;

  if (integrationTypeError) {
    throw new AppError(
      "Tipo de integração não configurada globalmente, entre em contato com o suporte",
    );
  }

  if (!integrationTypeSuccess.data) {
    throw new AppError(
      "Tipo de integração não configurada globalmente, entre em contato com o suporte",
    );
  }

  const doesProjectIsAlreadySetup = success.data
    ? success.data.projectIntegrations.findIndex(
        (integration) => integration.project.slug === slug,
      )
    : -1;

  if (doesProjectIsAlreadySetup === -1) {
    return (
      <TabsContent value="web-analytics" className="mt-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Web Analytics</CardTitle>
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

  return (
    <TabsContent value="web-analytics" className="mt-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Web Analytics</CardTitle>
            <CardDescription>
              Entenda o comportamento dos usuários. Dados claros para decisões
              baseadas em evidências.
            </CardDescription>
          </div>
          <div className="flex items-end gap-6">
            <SyncUmamiMetrics projectSlug={slug} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Suspense fallback={<SummaryCardsSkeleton />}>
            <MetricsGrid slug={slug} />
          </Suspense>
          <Suspense
            fallback={
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <LineChartSkeleton />
                </div>
                <BarChartSkeleton />
              </div>
            }
          >
            <ChartsContainer slug={slug} />
          </Suspense>

          <Suspense
            fallback={
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <LineChartSkeleton />
                <BarChartSkeleton /> 
                <BarChartSkeleton /> 
                <BarChartSkeleton />
              </div>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="col-span-3">
                <DeviceAndSoChartsContainer slug={slug} />
              </div>
              <div className="col-span-1 h-full">
                <RealTimeChart slug={slug} />
              </div>
            </div>
          </Suspense>

          <Suspense fallback={<IssuesTableSkeleton />}>
            <ListsContainer slug={slug} />
          </Suspense>
        </CardContent>
      </Card>
    </TabsContent>
  );
}

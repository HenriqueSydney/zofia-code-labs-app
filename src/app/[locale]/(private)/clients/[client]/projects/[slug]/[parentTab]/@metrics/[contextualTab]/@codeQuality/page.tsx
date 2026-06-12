import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getTranslations } from "next-intl/server";
import { getParams } from "@/utils/getParams";
import { TabsContent } from "@/components/ui/tabs";
import { operationWrapper } from "@/lib/operationWrapper";
import { OrganizationIntegrationWithDetails } from "@/repositories/IOrganizationIntegrationRepository";
import { findOrganizationIntegrationByIntegrationSlugAction } from "@/actions/integrations/findOrganizationIntegrationByIntegrationSlugAction";
import { ValidationError } from "@/errors";
import { CTAIntegration } from "../components/CTAIntegration";
import { IntegrationType } from "@/generated/prisma/client";
import { findIntegrationTypeBySlugAction } from "@/actions/integrations/findIntegrationTypeBySlugAction";
import { SyncSonarQubeMetrics } from "./_components/SyncSonarQubeMetrics";
import { MetricsGrid } from "./_components/MetricsGrid";
import { QualityStatusHeader } from "./_components/QualityStatusHeader";
import { SeverityDonutContainer } from "./_components/SeverityDonutContainer";
import { CovarageAndTechnicalChartContainer } from "./_components/CovarageAndTechnicalChartContainer";
import { IssueEvolutionContainer } from "./_components/IssueEvolutionContainer";
import { ProjectLiveContainer } from "./_components/ProjectLiveContainer";
import { Suspense } from "react";
import { SummaryCardsSkeleton } from "../../../../../../../../../../../components/skeletons/SummaryCardsSkeleton";
import { LineChartSkeleton } from "@/components/skeletons/LineChartSkeleton";
import { PieChartSkeleton } from "@/components/skeletons/PieSkeleton";
import { IssuesTableSkeleton } from "./_skeletons/IssuesTableSkeleton";
import { BarChartSkeleton } from "@/components/skeletons/BarChartSkeleton";

interface IParams {
  params: Promise<{
    client: string;
    slug: string;
    contextualTab: string;
  }>;
}

export default async function CodeQualityTab({ params }: IParams) {
  const t = await getTranslations("projects.metrics");
  const tCodeQuality = await getTranslations("projects.metrics.codeQuality");
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
    throw new ValidationError(t("common.integrationError"));
  }

  const [integrationTypeError, integrationTypeSuccess] = integrationType;

  if (integrationTypeError) {
    throw new ValidationError(t("common.integrationNotConfigured"));
  }

  if (!integrationTypeSuccess.data) {
    throw new ValidationError(t("common.integrationNotConfigured"));
  }

  const doesProjectIsAlreadySetup = success.data
    ? success.data.projectIntegrations.findIndex(
        (integration) => integration.project.slug === slug
      )
    : -1;

  if (doesProjectIsAlreadySetup === -1) {
    return (
      <TabsContent value="code-quality" className="mt-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">{tCodeQuality("ctaTitle")}</CardTitle>
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
    <TabsContent value="code-quality" className="mt-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">{tCodeQuality("title")}</CardTitle>
            <CardDescription>{tCodeQuality("description")}</CardDescription>
          </div>
          <div className="flex items-end gap-6">
            <Suspense fallback={null}>
              <QualityStatusHeader slug={slug} />
            </Suspense>

            <SyncSonarQubeMetrics projectSlug={slug} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Suspense fallback={<SummaryCardsSkeleton />}>
            <MetricsGrid slug={slug} />
          </Suspense>
          {/* Linha de Gráficos */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Suspense
              fallback={<LineChartSkeleton className="lg:col-span-4" />}
            >
              <IssueEvolutionContainer slug={slug} />
            </Suspense>

            <Suspense fallback={<PieChartSkeleton className="lg:col-span-3" />}>
              <SeverityDonutContainer slug={slug} />
            </Suspense>
          </div>

          <Suspense
            fallback={
              <div className="grid gap-4 md:grid-cols-2">
                <LineChartSkeleton />
                <BarChartSkeleton />
              </div>
            }
          >
            <CovarageAndTechnicalChartContainer slug={slug} />
          </Suspense>
          <Suspense fallback={<IssuesTableSkeleton />}>
            <ProjectLiveContainer slug={slug} />
          </Suspense>
        </CardContent>
      </Card>
    </TabsContent>
  );
}

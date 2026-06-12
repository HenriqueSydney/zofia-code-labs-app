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
import { CTAIntegration } from "../components/CTAIntegration";
import { ValidationError } from "@/errors";
import { findIntegrationTypeBySlugAction } from "@/actions/integrations/findIntegrationTypeBySlugAction";
import { operationWrapper } from "@/lib/operationWrapper";
import { IntegrationType } from "@/generated/prisma/client";
import { OrganizationIntegrationWithDetails } from "@/repositories/IOrganizationIntegrationRepository";
import { findOrganizationIntegrationByIntegrationSlugAction } from "@/actions/integrations/findOrganizationIntegrationByIntegrationSlugAction";

import { Suspense } from "react";
import { SummaryCardsSkeleton } from "./_skeletons/SummaryCardsSkeleton";
import { MetricsGrid } from "./_components/MetricsGrid";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { GitIntegrationConfig } from "@/services/git/IGitService";
import { LineChartSkeleton } from "@/components/skeletons/LineChartSkeleton";
import { BarChartSkeleton } from "@/components/skeletons/BarChartSkeleton";
import { CommitLineChart } from "./_components/CommitsLineChart";
import { SprintProgress } from "./_components/SprintProgress";
import { CICDTable } from "./_components/CICDTable";
import { Separator } from "@/components/ui/separator";
import { SuccessCICDRate } from "./_components/SuccessCICDRate";
import { ActivityTable } from "./_components/ActivityTable";
import { ListSkeleton } from "@/components/skeletons/ListSkeleton";
import { RepositoryStatsGrid } from "./_components/RepositoryStatsGrid";

interface IParams {
  params: Promise<{
    slug: string;
    contextualTab: string;
    page?: number;
    numberPerPage?: number;
  }>;
}

export default async function LifeCycle({ params }: IParams) {
  const t = await getTranslations("projects.metrics");
  const tLifecycle = await getTranslations("projects.metrics.lifecycle");
  const { slug, client } = await getParams<{
    slug: string;
    client: string;
    contextualTab: string;
  }>(params, ["slug", "client"]);

  const [orgIntegration, integrationType] = await Promise.all([
    operationWrapper<{
      data: OrganizationIntegrationWithDetails | null;
    }>(
      "action",
      "findOrganizationIntegrationByIntegrationSlugAction",
      () => {
        return findOrganizationIntegrationByIntegrationSlugAction("github");
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
        return findIntegrationTypeBySlugAction("github");
      },
      {
        cache: "no-cache",
      },
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

  const integrationTypeWithGitLogo = {
    ...integrationTypeSuccess.data,
    logo: "/git.svg",
  };

  const doesProjectIsAlreadySetup = success.data
    ? success.data.projectIntegrations.findIndex(
        (integration) => integration.project.slug === slug,
      )
    : -1;
  if (doesProjectIsAlreadySetup === -1) {
    return (
      <TabsContent value="life-cycle" className="mt-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">{tLifecycle("title")}</CardTitle>
          </CardHeader>
          <CardContent>
            {doesProjectIsAlreadySetup === -1 && (
              <CTAIntegration
                client={client}
                projectSlug={slug}
                integration={success.data}
                integrationType={integrationTypeWithGitLogo}
              />
            )}
          </CardContent>
        </Card>
      </TabsContent>
    );
  }

  const projectIntegration =
    success.data?.projectIntegrations[doesProjectIsAlreadySetup];

  // 2. Faz o cast do JSON genérico do Prisma para a nossa interface tipada
  const config = projectIntegration?.config as unknown as GitIntegrationConfig;

  // 3. Agora você pode acessar as propriedades sem erro de TS e com segurança
  const repoFullName = config?.full_name;

  return (
    <TabsContent value="life-cycle" className="mt-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">{tLifecycle("title")}</CardTitle>
            <CardDescription>{tLifecycle("description")}</CardDescription>
          </div>
          <div className="flex items-end gap-6">
            <Link href={`https://github.com/${repoFullName}`} target="_blank">
              <Button
                className="flex items-center justify-between"
                variant="outline"
              >
                {tLifecycle("accessGitHub")}
                <ExternalLink className="mb-1" />
              </Button>
            </Link>
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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <CommitLineChart slug={slug} />
              <SprintProgress slug={slug} />
            </div>
          </Suspense>
          <h3>{tLifecycle("cicdHealth")}</h3>
          <Separator />
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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <CICDTable slug={slug} />
              <SuccessCICDRate slug={slug} />
            </div>
          </Suspense>

          <h3>{tLifecycle("activities")}</h3>
          <Separator />
          <Suspense fallback={<ListSkeleton />}>
            <ActivityTable slug={slug} />
          </Suspense>

          <h3>{tLifecycle("repoStats")}</h3>
          <Separator />
          <Suspense fallback={<SummaryCardsSkeleton colsCount={4} />}>
            <RepositoryStatsGrid slug={slug} />
          </Suspense>
        </CardContent>
      </Card>
    </TabsContent>
  );
}

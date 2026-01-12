import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { ProjectWithDetails } from "@/repositories/IProjectsRepository";
import { operationWrapper } from "@/lib/operationWrapper";
import { FetchServiceTypeWithCategory } from "@/repositories/IServiceTypeRepository";
import { fetchServiceTypeAction } from "@/actions/services/fetchServiceTypeAction";
import { getParams } from "@/utils/getParams";
import { AppError } from "@/errors/AppError";
import { getProposalAction } from "@/actions/proposal/getProposal";
import { ProposalWithDetails } from "@/repositories/IProposalRepository";
import { getProjectBySlugAction } from "@/actions/projects/getProjectBySlug";
import { SummaryCardsSkeleton } from "../../../../../../../../../components/skeletons/SummaryCardsSkeleton";
import { Suspense } from "react";
import { MetricsCardsGrid } from "./_components/MetricsCardsGrid";
import { PieChartSkeleton } from "@/components/skeletons/PieSkeleton";
import { BacklogStatusDonutChart } from "./_components/BacklogStatusDonutChart";
import { SprintProgressBarChart } from "./_components/SprintProgressBarChart";
import { BacklogBurndownLineChart } from "./_components/BacklogBurndownLineChart";
import { LineChartSkeleton } from "@/components/skeletons/LineChartSkeleton";
import { FinancialHistoryChart } from "./_components/FinancialHistoryLineChart";

interface IOverviewTab {
  params: Promise<{ slug: string }>;
}

export default async function OverviewTab({ params }: IOverviewTab) {
  const { slug } = await getParams<{
    slug: string;
  }>(params, ["slug"]);

  const [projectResponse, serviceResponse] = await Promise.all([
    operationWrapper<{
      project: ProjectWithDetails;
    }>(
      "action",
      "getProjectBySlugAction",
      () => {
        return getProjectBySlugAction(slug);
      },
      {
        cache: "no-cache",
      }
    ),
    operationWrapper<{
      serviceTypes: FetchServiceTypeWithCategory[];
    }>(
      "action",
      "fetchServiceTypeAction",
      () => {
        return fetchServiceTypeAction();
      },
      {
        cache: "no-cache",
      }
    ),
  ]);

  const [getProjectError, getProjectSuccess] = projectResponse;

  if (getProjectError) {
    throw new AppError("Erro ao tentar localizar os projetos da Organização");
  }

  const [fetchServicesError, fetchServicesSuccess] = serviceResponse;

  const project = getProjectSuccess.project;
  const services = fetchServicesError ? [] : fetchServicesSuccess.serviceTypes;
  let contextualData: any = services;
  if (project.status === "PROPOSAL") {
    const [proposalError, proposalSuccess] =
      await operationWrapper<ProposalWithDetails>(
        "action",
        "getProposalAction",
        () => {
          return getProposalAction(project.proposal.id);
        },
        {
          cache: "no-cache",
        }
      );

    if (!proposalError && proposalSuccess) contextualData = proposalSuccess;
  }

  return (
    <TabsContent value="dashboard" className="space-y-6 mt-6">
      <Suspense fallback={<SummaryCardsSkeleton />}>
        <MetricsCardsGrid slug={slug} />
      </Suspense>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <FinancialHistoryChart slug={slug} />
        </div>
        <Suspense fallback={<PieChartSkeleton />}>
          <BacklogStatusDonutChart slug={slug} />
        </Suspense>
      </div>

      <Suspense fallback={<LineChartSkeleton />}>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Suspense fallback={<PieChartSkeleton />}>
              <BacklogBurndownLineChart slug={slug} />
            </Suspense>
          </div>
          <Suspense fallback={<PieChartSkeleton />}>
            <SprintProgressBarChart slug={slug} />
          </Suspense>
        </div>
      </Suspense>
    </TabsContent>
  );
}

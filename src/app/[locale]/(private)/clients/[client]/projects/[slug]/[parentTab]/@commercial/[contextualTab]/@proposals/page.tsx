import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@radix-ui/react-tabs";
import { CreateNewProposalButton } from "./CreateNewProposalButton";
import { ProjectWithDetails } from "@/repositories/IProjectsRepository";
import { fetchProposalHistory } from "@/actions/proposal/fetchProposalHistory";
import { getParams } from "@/utils/getParams";
import { operationWrapper } from "@/lib/operationWrapper";
import { ValidationError } from "@/errors";
import { ProposalWithDetails } from "@/repositories/IProposalRepository";
import { ProposalHistoryList } from "./ProposalHistoryList";
import { FileClock } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { getProjectBySlugAction } from "@/actions/projects/getProjectBySlug";
import { getTranslations } from "next-intl/server";
import { PERMISSIONS } from "@/constants/permissions";
import { hasPermission } from "@/utils/hasPermission";
import { auth } from "@/auth";

interface IProposalTab {
  params: Promise<{ slug: string; contextualTab: string }>;
}

export default async function ProposalTab({ params }: IProposalTab) {
  const t = await getTranslations("projects.commercial.proposals");
  const tErrors = await getTranslations("projects.errors");
  const { slug } = await getParams<{ slug: string }>(params, ["slug"]);
  const session = await auth();
  const [projectError, projectSuccess] = await operationWrapper<{
    project: ProjectWithDetails;
  }>(
    "action",
    "getProjectAction",
    () => {
      return getProjectBySlugAction(slug);
    },
    {
      cache: "no-cache",
    },
  );

  if (projectError) throw new ValidationError(tErrors("projectNotFound"));

  const project = projectSuccess.project;

  const [historyError, historySuccess] = await operationWrapper<
    ProposalWithDetails[]
  >(
    "action",
    "fetchProposalHistory",
    () => {
      return fetchProposalHistory(project.id);
    },
    {
      cache: "no-cache",
    },
  );

  if (historyError) {
    throw new ValidationError(tErrors("proposalsHistory"));
  }

  const canCreateProposal = hasPermission(
    session?.user,
    PERMISSIONS.PROPOSAL.CREATE,
  );
  const canReadProposal = hasPermission(
    session?.user,
    PERMISSIONS.PROPOSAL.READ,
  );

  if (!canReadProposal) {
    return (
      <EmptyState
        title={tErrors("noPermissionTitle")}
        icon={FileClock}
        description={tErrors("noPermissionProposal")}
      />
    );
  }

  return (
    <TabsContent value="proposals" className="mt-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">{t("historyTitle")}</CardTitle>
          {canCreateProposal && <CreateNewProposalButton project={project} />}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {historySuccess.map((proposal) => (
              <ProposalHistoryList
                key={proposal.id}
                proposal={proposal}
                project={project}
                canCreateProposal={canCreateProposal}
              />
            ))}

            {historySuccess.length === 0 && (
              <EmptyState
                title={t("emptyTitle")}
                icon={FileClock}
                description={t("emptyDescription")}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}

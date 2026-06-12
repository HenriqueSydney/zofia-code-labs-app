import { TabsContent } from "@/components/ui/tabs";
import { ProjectWithDetails } from "@/repositories/IProjectsRepository";
import ProjectDocuments from "./_components/ProjectDocuments";
import ProjectActivityLog from "./_components/ProjectActivityLog";
import ProjectTimeline from "./ProjectTimeline";
import { operationWrapper } from "@/lib/operationWrapper";
import { FetchServiceTypeWithCategory } from "@/repositories/IServiceTypeRepository";
import { fetchServiceTypeAction } from "@/actions/services/fetchServiceTypeAction";
import { getParams } from "@/utils/getParams";
import { ValidationError } from "@/errors";
import { getProposalAction } from "@/actions/proposal/getProposal";
import { ProposalWithDetails } from "@/repositories/IProposalRepository";
import { getProjectBySlugAction } from "@/actions/projects/getProjectBySlug";
import { ProjectSummary } from "./_components/ProjectSummary";
import { ProjectNotesContainer } from "./_components/ProjectNotesContainer";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { hasAnyPermission, hasPermission } from "@/utils/hasPermission";
import { PERMISSIONS } from "@/constants/permissions";
import { Role } from "@/generated/prisma/enums";
import { cn } from "@/utils/twMerge";

interface IOverviewTab {
  params: Promise<{ slug: string }>;
}

export default async function OverviewTab({ params }: IOverviewTab) {
  const { slug } = await getParams<{
    slug: string;
  }>(params, ["slug"]);

  const [projectResponse, serviceResponse, t, session] = await Promise.all([
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
      },
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
      },
    ),
    getTranslations("projects.overview"),
    auth(),
  ]);

  const [getProjectError, getProjectSuccess] = projectResponse;

  if (getProjectError) {
    throw new ValidationError(t("errors.loadProject"));
  }

  const [fetchServicesError, fetchServicesSuccess] = serviceResponse;

  const project = getProjectSuccess.project;
  const services = fetchServicesError ? [] : fetchServicesSuccess.serviceTypes;

  const canReadObservations = hasPermission(
    session?.user,
    PERMISSIONS.PROJECT.READ_OBSERVATIONS,
  );
  const canReadRecentUpdates = hasPermission(
    session?.user,
    PERMISSIONS.PROJECT.READ_RECENT_UPDATES,
  );
  const canManageDocuments = hasAnyPermission(session?.user, [
    PERMISSIONS.PROJECT.UPDATE,
    PERMISSIONS.PROJECT.MANAGE,
  ]);
  const canUpdateProject = hasPermission(
    session?.user,
    PERMISSIONS.PROJECT.UPDATE,
  );
  const canDeleteProject = hasPermission(
    session?.user,
    PERMISSIONS.PROJECT.DELETE,
  );
  const isOwner = session?.user?.role === Role.OWNER;
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
        },
      );

    if (!proposalError && proposalSuccess) contextualData = proposalSuccess;
  }

  return (
    <TabsContent value="overview" className="space-y-6 mt-6">
      {/* Summary Section */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ProjectSummary project={project} />
        <ProjectDocuments project={project} canManage={canManageDocuments} />
      </div>
      <ProjectTimeline
        project={project}
        contextData={contextualData}
        canUpdate={canUpdateProject}
        canDelete={canDeleteProject}
        isOwner={isOwner}
      />

      {/* Observations Section */}
      <div
        className={cn(
          "w-full grid grid-cols-1  gap-6",
          !canReadObservations && "lg:grid-cols-1",
          !canReadRecentUpdates && "lg:grid-cols-2",
        )}
      >
        {canReadObservations && <ProjectNotesContainer project={project} />}

        {canReadRecentUpdates && <ProjectActivityLog />}
      </div>
    </TabsContent>
  );
}

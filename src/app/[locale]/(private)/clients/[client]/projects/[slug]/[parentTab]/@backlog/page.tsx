import { TabsContent } from "@/components/ui/tabs";
import { ProjectWithDetails } from "@/repositories/IProjectsRepository";
import { operationWrapper } from "@/lib/operationWrapper";
import { getParams } from "@/utils/getParams";
import { ValidationError } from "@/errors";
import { BacklogFilter } from "./components/BacklogFilter";
import { StatsAndViewToggle } from "./components/StatsAndViewToggle";
import { BacklogKanban } from "./components/BacklogKanban";
import { BacklogList } from "./components/BacklogList";
import { listBacklogsItemsAction } from "@/actions/backlog/listBacklogItemsAction";
import { BacklogPriority, BacklogStatus } from "@/generated/prisma/enums";
import { ListBacklogItemsResponse } from "@/useCases/backlog/ListBacklogItemsUseCase";
import { auth } from "@/auth";
import { getProjectBySlugAction } from "@/actions/projects/getProjectBySlug";
import { EmptyState } from "@/components/EmptyState";
import { ListTodo } from "lucide-react";
import { BacklogCreateForm } from "./components/BacklogCreateForm";
import { IncludeServiceDefaultBacklog } from "./components/IncludeServiceDefaultBacklog";
import { getTranslations } from "next-intl/server";
import { hasPermission } from "@/utils/hasPermission";
import { PERMISSIONS } from "@/constants/permissions";

interface IBacklog {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    viewMode: string;
    query: string;
    priority: string;
    status: string;
  }>;
}

export default async function Backlog({ params, searchParams }: IBacklog) {
  const t = await getTranslations("projects.backlog");
  const tErrors = await getTranslations("projects.errors");
  const tCommon = await getTranslations("common.errors");
  const { slug } = await getParams<{
    slug: string;
  }>(params, ["slug"]);

  const {
    viewMode: rawViewMode,
    priority,
    query,
    status,
  } = await getParams<{
    viewMode: string;
    query: string;
    priority: BacklogPriority | "ALL";
    status: BacklogStatus | "ALL";
  }>(searchParams, ["viewMode", "priority", "query", "status"]);
  const session = await auth();

  if (!session) throw new ValidationError(tCommon("unauthenticated"));

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

  const canManageBacklog = hasPermission(
    session.user,
    PERMISSIONS.BACKLOG.MANAGE,
  );
  const canReadBacklog = hasPermission(session.user, PERMISSIONS.BACKLOG.READ);

  if (!canReadBacklog) {
    return (
      <TabsContent value="backlog" className="space-y-6 mt-6">
        <EmptyState
          title={tErrors("noPermissionTitle")}
          icon={ListTodo}
          description={tErrors("noPermissionBacklog")}
        />
      </TabsContent>
    );
  }

  const [error, success] = await operationWrapper<{
    data: ListBacklogItemsResponse;
  }>(
    "action",
    "listBacklogsItemsAction",
    () => {
      return listBacklogsItemsAction({
        projectId: project.id,
        query,
        priority,
        status,
      });
    },
    {
      cache: "no-cache",
    },
  );

  if (error) {
    throw new ValidationError(tErrors("backlogNotFound"));
  }

  const currentViewMode = rawViewMode === "kanban" ? "kanban" : "list";

  const backlogTotalOfRegisters = success.data.items.length;

  return (
    <TabsContent value="backlog" className="space-y-6 mt-6">
      <BacklogFilter
        projectId={project.id}
        canManageBacklog={canManageBacklog}
      />

      <div className="flex gap-2">
        {canManageBacklog && (
          <IncludeServiceDefaultBacklog
            buttonLabel={false}
            projectId={project.id}
            availableServices={project.projectServices.map((service) => ({
              id: service.serviceTypeId,
              name: service.serviceType.name,
            }))}
          />
        )}
        <StatsAndViewToggle
          canManageBacklog={canManageBacklog}
          backlogLength={
            success.data.items.filter(
              (item) => item.status !== "CANCELED" && item.status !== "DONE",
            ).length
          }
          totalPoints={success.data.totalPoints}
        />
      </div>
      {backlogTotalOfRegisters === 0 && (
        <EmptyState
          title="Backlog do Produto"
          icon={ListTodo}
          description={t("emptyDescription")}
          action={
            canManageBacklog ? (
              <div className="flex gap-2 items-center">
                <BacklogCreateForm projectId={project.id} />
                <IncludeServiceDefaultBacklog
                  projectId={project.id}
                  availableServices={project.projectServices.map((service) => ({
                    id: service.serviceTypeId,
                    name: service.serviceType.name,
                  }))}
                />
              </div>
            ) : undefined
          }
        />
      )}

      <div key={currentViewMode} className="w-full">
        {currentViewMode === "kanban" && backlogTotalOfRegisters > 0 && (
          <BacklogKanban
            backlog={success.data.items}
            canManageBacklog={canManageBacklog}
          />
        )}

        {currentViewMode === "list" && backlogTotalOfRegisters > 0 && (
          <BacklogList
            backlog={success.data.items}
            canManageBacklog={canManageBacklog}
          />
        )}
      </div>
    </TabsContent>
  );
}

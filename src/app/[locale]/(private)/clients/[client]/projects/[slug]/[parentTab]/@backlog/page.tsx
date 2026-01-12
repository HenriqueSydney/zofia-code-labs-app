import { TabsContent } from "@/components/ui/tabs";
import { ProjectWithDetails } from "@/repositories/IProjectsRepository";
import { operationWrapper } from "@/lib/operationWrapper";
import { getProjectAction } from "@/actions/projects/getProject";
import { getParams } from "@/utils/getParams";
import { AppError } from "@/errors/AppError";
import { BacklogFilter } from "./components/BacklogFilter";
import { StatsAndViewToggle } from "./components/StatsAndViewToggle";
import { BacklogKanban } from "./components/BacklogKanban";
import { BacklogList } from "./components/BacklogList";
import { getBacklogAction } from "@/actions/backlog/getBacklogItemAction";
import { BacklogItemWithDetails } from "@/repositories/IBacklogItemsRepository";
import { listBacklogsItemsAction } from "@/actions/backlog/listBacklogItemsAction";
import { BacklogPriority, BacklogStatus } from "@/generated/prisma/enums";
import { ListBacklogItemsResponse } from "@/useCases/backlog/ListBacklogItemsUseCase";
import { listUsersByOrganizationAction } from "@/actions/users/listUsersByOrganizationAction";
import { auth } from "@/auth";
import { UserSafe } from "@/repositories/IUsersRepository";
import { getProjectBySlugAction } from "@/actions/projects/getProjectBySlug";
import { EmptyState } from "@/components/EmptyState";
import { ListTodo } from "lucide-react";
import { BacklogCreateForm } from "./components/BacklogCreateForm";

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

  if (!session) throw new AppError("Usuário não autenticado");

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
    }
  );

  if (projectError) throw new AppError("Falha ao tentar localizar o projeto");

  const project = projectSuccess.project;

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
    }
  );

  if (error) {
    throw new AppError("Lista de backlog não localizada");
  }

  const currentViewMode = rawViewMode === "kanban" ? "kanban" : "list";

  const backlogTotalOfRegisters = success.data.items.length;
  return (
    <TabsContent value="backlog" className="space-y-6 mt-6">
      {/* Summary Section */}

      <BacklogFilter projectId={project.id} />

      <StatsAndViewToggle
        backlogLength={
          success.data.items.filter(
            (item) => item.status !== "CANCELED" && item.status !== "DONE"
          ).length
        }
        totalPoints={success.data.totalPoints}
      />

      {backlogTotalOfRegisters === 0 && (
        <EmptyState
          title="Backlog do Produto"
          icon={ListTodo}
          description="Nenhum item de backlog cadastrado até o momento. Inicie a gestão do backlog com o cadastramento de ao menos 1 item."
          action={<BacklogCreateForm projectId={project.id} />}
        />
      )}

      <div key={currentViewMode} className="w-full">
        {currentViewMode === "kanban" && backlogTotalOfRegisters > 0 && (
          <BacklogKanban backlog={success.data.items} />
        )}

        {currentViewMode === "list" && backlogTotalOfRegisters > 0 && (
          <BacklogList backlog={success.data.items} />
        )}
      </div>
    </TabsContent>
  );
}

import { SectionHeading } from "@/components/SectionHeading";
import { ProjectForm } from "./_components/ProjectForm";
import { getParams } from "@/utils/getParams";
import { fetchClientsAction } from "@/actions/clients/fetchClientsAction";
import { operationWrapper } from "@/lib/operationWrapper";
import { ProjectWithDetails } from "@/repositories/IProjectsRepository";
import { getProjectBySlugAction } from "@/actions/projects/getProjectBySlug";
import { Client } from "@/generated/prisma/client";
import { ValidationError } from "@/errors";
import { getClientAction } from "@/actions/clients/getClientAction";
import { GoBackButton } from "@/components/GoBackButton";
import { ClientWithStats } from "@/repositories/IClientsRepository";
import { getTranslations } from "next-intl/server";
import { PERMISSIONS } from "@/constants/permissions";
import { hasPermission } from "@/utils/hasPermission";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

interface IProjectFormPage {
  params?: Promise<{ [key: string]: string | undefined }>;
}

export default async function ProjectFormPage({ params }: IProjectFormPage) {
  const { client, slug } = await getParams(params, ["slug", "client"]);
  const t = await getTranslations("projects.form");
  const tErrors = await getTranslations("projects.errors");
  const newProject = slug === "new-project";
  const session = await auth();
  const canCreate = hasPermission(session?.user, PERMISSIONS.PROJECT.CREATE);
  const canUpdate = hasPermission(session?.user, PERMISSIONS.PROJECT.UPDATE);

  if (!canCreate && newProject) {
    redirect(`/clients/${client}/projects?erro=projectCreatePermissionDenied`);
  }

  if (!canUpdate && !newProject) {
    redirect(`/clients/${client}/projects?erro=projectUpdatePermissionDenied`);
  }

  const [_, clientsSuccess] = await operationWrapper<{
    clients: Client[];
  }>(
    "action",
    "fetchClientsAction",
    () => {
      return fetchClientsAction();
    },
    {
      cache: "no-cache",
    },
  );

  let clientId: string | undefined;
  if (client) {
    const [_, clientSuccess] = await operationWrapper<{
      client: ClientWithStats | null;
    }>(
      "action",
      "getClientAction",
      () => {
        return getClientAction(client);
      },
      {
        cache: "no-cache",
      },
    );

    clientId = clientSuccess?.client?.id;
  }

  if (newProject) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <SectionHeading
            title={t("createTitle")}
            description={t("createDescription")}
          />
        </div>
        <div className="max-w-5xl">
          <ProjectForm
            clients={clientsSuccess?.clients ?? []}
            initialData={{ clientId }}
          />
        </div>
      </div>
    );
  }

  const [error, success] = await operationWrapper<{
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
  );

  if (error) {
    throw new ValidationError(tErrors("notFoundForEdit"));
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-5 items-start">
        <GoBackButton withLabel={false} className="mt-2" />
        <SectionHeading
          title={t("editTitle")}
          description={`${t("editTitle")} ${success.project.name}`}
        />
      </div>

      <div className="max-w-5xl">
        <ProjectForm
          projectId={success.project.id}
          initialData={{ ...success.project }}
          clients={clientsSuccess?.clients ?? []}
        />
      </div>
    </div>
  );
}

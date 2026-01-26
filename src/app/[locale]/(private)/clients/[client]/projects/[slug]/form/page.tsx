import { SectionHeading } from "@/components/SectionHeading";
import { ProjectForm } from "./_components/ProjectForm";
import { getParams } from "@/utils/getParams";
import { fetchClientsAction } from "@/actions/clients/fetchClientsAction";
import { operationWrapper } from "@/lib/operationWrapper";
import { ProjectWithDetails } from "@/repositories/IProjectsRepository";
import { getProjectBySlugAction } from "@/actions/projects/getProjectBySlug";
import { Client } from "@/generated/prisma/client";
import { AppError } from "@/errors/AppError";
import { getClientAction } from "@/actions/clients/getClientAction";
import { GoBackButton } from "@/components/GoBackButton";

interface IProjectFormPage {
  params?: Promise<{ [key: string]: string | undefined }>;
}

export default async function ProjectFormPage({ params }: IProjectFormPage) {
  const { client, slug } = await getParams(params, ["slug", "client"]);

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
      client: Client;
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

    clientId = clientSuccess?.client.id;
  }

  const newProject = slug === "new-project";

  if (newProject) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <SectionHeading
            title="Cadastrar novo projeto"
            description={`Cadastre um novo projeto e comece a gerenciá-lo`}
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
    throw new AppError("Projeto não localizado para edição");
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-5 items-start">
        <GoBackButton withLabel={false} className="mt-2" />
        <SectionHeading
          title="Editar projeto"
          description={`Edite o projeto ${success.project.name}`}
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

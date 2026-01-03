import { SectionHeading } from "@/components/SectionHeading";
import { ProjectForm } from "./components/ProjectForm";
import { getParams } from "@/utils/getParams";
import { fetchClientsAction } from "@/actions/clients/fetchClientsAction";
import { operationWrapper } from "@/lib/operationWrapper";
import { ProjectWithDetails } from "@/repositories/IProjectsRepository";
import { getProjectBySlugAction } from "@/actions/projects/getProjectBySlug";
import { Client } from "@/generated/prisma/client";
import { AppError } from "@/errors/AppError";

interface IProjectFormPage {
  params?: Promise<{ [key: string]: string | undefined }>;
}

export default async function ProjectFormPage({ params }: IProjectFormPage) {
  const { slug } = await getParams(params, ["slug"]);

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
    }
  );

  const newProject = slug === "new-project";

  if (newProject) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <SectionHeading
            title={`Cadastrar novo projeto`}
            description={`Cadastre um novo projeto e comece a gerenciá-lo`}
          />
        </div>
        <div className="max-w-5xl">
          <ProjectForm clients={clientsSuccess?.clients ?? []} />
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
    }
  );

  if (error) {
    throw new AppError("Projeto não localizado para edição");
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SectionHeading
          title={`Cadastrar novo projeto`}
          description={`Cadastre um novo projeto e comece a gerenciá-lo`}
        />
      </div>
      <div className="max-w-5xl">
        <ProjectForm
          projectId={success.project.id}
          description={success?.project.description}
          clientId={success?.project.clientId}
          name={success?.project.name}
          clients={clientsSuccess?.clients ?? []}
        />
      </div>
    </div>
  );
}

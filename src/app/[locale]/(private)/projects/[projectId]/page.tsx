import { SectionHeading } from "@/components/SectionHeading";
import { ProjectForm } from "./components/ProjectForm";
import { getParams } from "@/utils/getParams";
import { fetchClientsAction } from "@/actions/clients/fetchClientsAction";

interface IProjectFormPage {
  params?: Promise<{ [key: string]: string | undefined }>;
}

export default async function ProjectFormPage({ params }: IProjectFormPage) {
  const { projectId } = await getParams(params, ["projectId"]);

  const { clients } = await fetchClientsAction();

  const id = projectId === "new-project" ? undefined : projectId;
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SectionHeading
          title={`Cadastrar novo projeto`}
          description={`Cadastre um novo projeto e comece a gerenciá-lo`}
        />
      </div>
      <div className="max-w-5xl">
        <ProjectForm projectId={id} clients={clients} />
      </div>
    </div>
  );
}

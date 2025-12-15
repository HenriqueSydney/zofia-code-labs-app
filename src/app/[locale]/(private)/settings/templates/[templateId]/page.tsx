import { SectionHeading } from "@/components/SectionHeading";
import { getParams } from "@/utils/getParams";
import { DocumentTemplateForm } from "./components/DocumentTemplateForm";

interface IDocumentsPage {
  params?: Promise<{ [key: string]: string | undefined }>;
}

export default async function Documents({ params }: IDocumentsPage) {
  const { projectId } = await getParams(params, ["projectId"]);
  const id = projectId === "new-project" ? undefined : projectId;

  return (
    <div className="space-y-8">
      <SectionHeading
        title="Gestão de Modelo de Documentos"
        description="Edite seu modelo de documentos"
      />
      <DocumentTemplateForm />
    </div>
  );
}

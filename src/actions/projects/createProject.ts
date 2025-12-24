"use server";

import { auth } from "@/auth";
import { projectFormSchema } from "@/schemas/projects/createProjectSchema";
import { makeCreateProjectUseCase } from "@/useCases/projects/factories/makeCreateProjectUseCase";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createProjectAction(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "Não autorizado" };

  // 1. Parse dos dados simples
  const rawData = {
    name: formData.get("name"),
    description: formData.get("description"),
    clientId: formData.get("clientId"),
    documents: formData.getAll("documents"),
  };

  // 2. Validação Zod
  const validation = projectFormSchema.safeParse(rawData);
  if (!validation.success) {
    return { error: validation.error.flatten().fieldErrors };
  }

  // 3. Extração dos Arquivos
  // formData.getAll retorna (File | string)[], forçamos o tipo
  const files = formData.getAll("documents").filter((item): item is File => {
    return item instanceof File && item.size > 0;
  });
  let projectId: string | null = null;
  const useCase = makeCreateProjectUseCase();
  try {
    const project = await useCase.execute({
      ...validation.data,
      files,
      userId: session.user.id,
      organizationId: session.user.organizationId,
    });
    projectId = project.id;
    revalidatePath("/projects");
  } catch (error) {
    console.error(error);
    return { error: "Erro ao criar projeto." };
  }

  if (projectId) {
    redirect(`/projects/${projectId}/project/overview`);
  }
}

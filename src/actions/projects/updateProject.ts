"use server";

import { auth } from "@/auth";
import { handleErrors } from "@/errors/handleErrors";
import { ProjectWithDetails } from "@/repositories/IProjectsRepository";
import { updateProjectSchema } from "@/schemas/projects/updateProjectSchema";
import { makeUpdateProjectUseCase } from "@/useCases/projects/factories/makeUpdateProjectUseCase";
import { revalidatePath } from "next/cache";
import { redirect, RedirectType } from "next/navigation";

export async function updateProjectAction(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "Não autorizado" };

  const id = formData.get("id") as string;

  if (!id) {
    return { error: "ID do projeto é obrigatório para atualização." };
  }

  // 1. Parse e Validação dos dados
  // O Zod parseia apenas o que está no schema. O resto é ignorado.
  const rawData = {
    id,
    name: formData.get("name"),
    description: formData.get("description"),
    clientId: formData.get("clientId"),
    priority: formData.get("priority"),
    totalBudget: Number(formData.get("totalBudget")),
    estimatedStartDate: formData.get("estimatedStartDate"),
    endDate: formData.get("endDate"),
    tags: formData.getAll("tags"),
  };

  const validation = updateProjectSchema.safeParse(rawData);

  if (!validation.success) {
    return { error: validation.error.flatten().fieldErrors };
  }

  // 2. Extração de NOVOS arquivos
  const newFiles = formData.getAll("documents").filter((item): item is File => {
    return item instanceof File && item.size > 0;
  });

  const useCase = makeUpdateProjectUseCase();
  let project: Omit<ProjectWithDetails, "projectServices" | "proposal">;
  try {
    project = await useCase.execute({
      ...validation.data, // name, description, client...
      id,
      newFiles,
      userId: session.user.id,
      organizationId: session.user.organizationId,
    });

    revalidatePath("/projects");
    revalidatePath(`/clients/${project.client.slug}/projects`);
  } catch (error) {
    const errorMessage = handleErrors(error);
    return { error: errorMessage };
  }

  if (project) {
    redirect(
      `/clients/${project.client.slug}/projects/${project.slug}/overview`,
      RedirectType.replace,
    );
  }
}

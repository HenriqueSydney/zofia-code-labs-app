"use server";

import { auth } from "@/auth";
import { updateProjectSchema } from "@/schemas/projects/updateProjectSchema";
import { makeUpdateProjectUseCase } from "@/useCases/projects/factories/makeUpdateProjectUseCase";
import { revalidatePath } from "next/cache";

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
    serviceTypeId: formData.get("serviceTypeId"),
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

  try {
    await useCase.execute({
      ...validation.data, // name, description, client...
      id,
      newFiles,
      userId: session.user.id,
    });
  } catch (error) {
    console.error(error);
    return { error: "Erro ao atualizar o projeto." };
  }

  revalidatePath("/projects");
  revalidatePath(`/projects/${id}`);

  // Opcional: Redirecionar ou apenas retornar sucesso para mostrar um Toast
  return { success: true, message: "Projeto atualizado com sucesso!" };
}

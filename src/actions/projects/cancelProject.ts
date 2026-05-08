"use server";

import { auth } from "@/auth";
import { cancelProjectSchema } from "@/schemas/projects/cancelProjectSchema";
import { makeCancelProjectUseCase } from "@/useCases/projects/factories/makeCancelProjectUseCase";
import { revalidatePath } from "next/cache";

export async function cancelProjectAction(projectId: string) {
  try {
    const session = await auth();
    if (!session?.user) return { error: "Não autorizado" };

    const validation = cancelProjectSchema.safeParse({ id: projectId });
    if (!validation.success)
      return { error: "Identificador do projecto inválido" };

    const useCase = makeCancelProjectUseCase();

    const { slug, clientSlug } = await useCase.execute({ projectId, userId: session.user.id });
    revalidatePath(`/clients/${clientSlug}/projects/${slug}`);
    revalidatePath("/projects");
    return { success: true, message: "Projecto cancelado com sucesso." };
  } catch (error) {
    return { error: "Erro ao deletar projeto." };
  }
}

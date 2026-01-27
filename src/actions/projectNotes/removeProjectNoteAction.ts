"use server";

import { auth } from "@/auth";
import {
  removeProjectNoteSchema,
  RemoveProjectNoteSchemaValues,
} from "@/schemas/projectNote/removeProjectNoteSchema";
import { makeRemoveProjectNoteUseCase } from "@/useCases/projectNotes/factories/makeRemoveProjectNotesUseCase";
import { revalidatePath } from "next/cache";

export async function removeProjectNoteAction(
  projectId: string,
  data: RemoveProjectNoteSchemaValues,
) {
  const session = await auth();
  if (!session?.user) {
    return {
      success: false,
      message: "Sessão expirada ou usuário não logado.",
    };
  }

  // 2. Validação Zod (Input)
  const parsed = removeProjectNoteSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0].message || "Dados inválidos.",
    };
  }

  const { id } = parsed.data;

  try {
    const useCase = makeRemoveProjectNoteUseCase();

    const projectNotes = await useCase.execute({
      projectId,
      id,
      userId: session.user.id, //session.user.id,
    });

    // 5. Revalidação de cache (opcional, ajusta conforme sua rota)
    revalidatePath("/projects");
    revalidatePath(
      `/clients/${projectNotes.project.client.slug}/projects/${projectNotes.project.slug}`,
    );

    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        message: error.message,
      };
    }

    return {
      success: false,
      message: "Erro interno ao editar observação.",
    };
  }
}

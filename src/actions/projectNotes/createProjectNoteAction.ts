"use server";

import { auth } from "@/auth";
import {
  createProjectNoteSchema,
  CreateProjectNoteSchemaValues,
} from "@/schemas/projectNote/createProjectNoteSchema";
import { makeCreateProjectNoteUseCase } from "@/useCases/projectNotes/factories/makeCreateProjectNotesUseCase";
import { revalidatePath } from "next/cache";

export async function createProjectNoteAction(
  projectId: string,
  data: CreateProjectNoteSchemaValues
) {
  const session = await auth();
  if (!session?.user) {
    return {
      success: false,
      message: "Sessão expirada ou usuário não logado.",
    };
  }

  // 2. Validação Zod (Input)
  const parsed = createProjectNoteSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0].message || "Dados inválidos.",
    };
  }

  const { content } = parsed.data;

  try {
    const createServiceCategoryUseCase = makeCreateProjectNoteUseCase();

    await createServiceCategoryUseCase.execute({
      projectId,
      content,
      userId: session.user.id,
    });

    // 5. Revalidação de cache (opcional, ajusta conforme sua rota)
    revalidatePath("/projects");
    revalidatePath(`/clients/${client.slug}/projects/${slug}`);

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
      message: "Erro interno ao criar observação.",
    };
  }
}

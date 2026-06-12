"use server";

import { resolveActionErrorMessage, resolveSuccessMessage, serverErrorMessage } from "@/errors/resolveActionErrorMessage";
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
      message: await serverErrorMessage("sessionExpiredNotLoggedIn"),
    };
  }

  // 2. Validação Zod (Input)
  const parsed = removeProjectNoteSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0].message || await serverErrorMessage("invalidData"),
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
    return {
      success: false,
      message: await resolveActionErrorMessage(error),
    };
  }
}

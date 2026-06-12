"use server";

import { resolveActionErrorMessage, resolveSuccessMessage, serverErrorMessage } from "@/errors/resolveActionErrorMessage";
import { auth } from "@/auth";
import {
  updateProjectNoteSchema,
  UpdateProjectNoteSchemaValues,
} from "@/schemas/projectNote/updateProjectNoteSchema";
import { makeUpdateProjectNoteUseCase } from "@/useCases/projectNotes/factories/makeUpdateProjectNotesUseCase";
import { revalidatePath } from "next/cache";

export async function updateProjectNoteAction(
  projectId: string,
  data: UpdateProjectNoteSchemaValues,
) {
  const session = await auth();
  if (!session?.user) {
    return {
      success: false,
      message: await serverErrorMessage("sessionExpiredNotLoggedIn"),
    };
  }

  // 2. Validação Zod (Input)
  const parsed = updateProjectNoteSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0].message || await serverErrorMessage("invalidData"),
    };
  }

  const { content, id } = parsed.data;

  try {
    const updateServiceCategoryUseCase = makeUpdateProjectNoteUseCase();

    const projectNotes = await updateServiceCategoryUseCase.execute({
      projectId,
      id,
      content,
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

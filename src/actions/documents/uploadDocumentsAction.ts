"use server";

import { resolveActionErrorMessage, resolveSuccessMessage, serverErrorMessage } from "@/errors/resolveActionErrorMessage";
import { revalidatePath } from "next/cache";
import { makeAddProjectDocumentUseCase } from "@/useCases/projects/factories/makeAddProjectDocumentUseCase";
import { auth } from "@/auth";

export async function uploadDocumentsAction(formData: FormData) {
  try {
    const session = await auth();

    if (!session?.user) {
      return {
        success: false,
        message: await serverErrorMessage("sessionExpiredNotLoggedIn"),
      };
    }

    const projectId = formData.get("projectId") as string;
    // O getAll recupera todos os arquivos enviados com a mesma chave 'files'
    const files = formData.getAll("files") as File[];

    if (!projectId) {
      return {
        success: false,
        message: await serverErrorMessage("projectIdNotProvided"),
      };
    }

    if (!files || files.length === 0) {
      return { success: false, message: await serverErrorMessage("noFileSelected") };
    }

    const addDocumentsUseCase = makeAddProjectDocumentUseCase();

    // Execução
    await addDocumentsUseCase.execute({
      projectId,
      files,
      userId: session.user.id,
    });

    // Revalidação para atualizar a lista na tela imediatamente
    revalidatePath(`/projects/${projectId}`);

    return { success: true, message: await resolveSuccessMessage("documentsAdded") };
  } catch (error) {
    return {
      success: false,
      message: await resolveActionErrorMessage(error),
    };
  }
}

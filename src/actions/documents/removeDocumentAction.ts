"use server";

import { resolveActionErrorMessage, resolveSuccessMessage, serverErrorMessage } from "@/errors/resolveActionErrorMessage";
import { revalidatePath } from "next/cache";
import { makeRemoveProjectDocumentUseCase } from "@/useCases/projects/factories/makeRemoveProjectDocumentUseCase";
import { auth } from "@/auth";

export async function removeDocument(documentId: string, projectId: string) {
  try {
    const session = await auth();

    if (!session?.user) {
      return {
        success: false,
        message: await serverErrorMessage("sessionExpiredNotLoggedIn"),
      };
    }
    const removeDocumentUseCase = makeRemoveProjectDocumentUseCase();

    // Execução
    const { slug, clientSlug } = await removeDocumentUseCase.execute({
      projectId,
      documentId,
      userId: session.user.id,
    });

    // Revalidação do Cache
    // Atualiza a página do projeto para remover o documento da lista visualmente
    revalidatePath(`/clients/${clientSlug}/projects/${slug}`);
    revalidatePath(`/projects`); // Opcional, se houver listagem global

    return { success: true, message: await resolveSuccessMessage("documentRemoved") };
  } catch (error) {
    return {
      success: false,
      message: await resolveActionErrorMessage(error),
    };
  }
}

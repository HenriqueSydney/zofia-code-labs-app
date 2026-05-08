"use server";

import { revalidatePath } from "next/cache";
import { makeRemoveProjectDocumentUseCase } from "@/useCases/projects/factories/makeRemoveProjectDocumentUseCase";
import { auth } from "@/auth";

export async function removeDocument(documentId: string, projectId: string) {
  try {
    const session = await auth();

    if (!session?.user) {
      return {
        success: false,
        message: "Sessão expirada ou usuário não logado.",
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

    return { success: true, message: "Documento removido com sucesso." };
  } catch (error) {
    console.error("Erro na action removeDocument:", error);
    return {
      success: false,
      message: "Erro ao remover documento. Tente novamente.",
    };
  }
}

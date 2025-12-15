"use server";

import { revalidatePath } from "next/cache";
import { makeAddProjectDocumentUseCase } from "@/useCases/projects/factories/makeAddProjectDocumentUseCase";
import { auth } from "@/auth";

export async function uploadDocumentsAction(formData: FormData) {
  try {
    const session = await auth();

    if (!session?.user) {
      return {
        success: false,
        message: "Sessão expirada ou usuário não logado.",
      };
    }

    const projectId = formData.get("projectId") as string;
    // O getAll recupera todos os arquivos enviados com a mesma chave 'files'
    const files = formData.getAll("files") as File[];

    if (!projectId) {
      return { success: false, message: "ID do projeto não fornecido." };
    }

    if (!files || files.length === 0) {
      return { success: false, message: "Nenhum arquivo selecionado." };
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

    return { success: true, message: "Documentos adicionados com sucesso!" };
  } catch (error) {
    console.error("Erro na action uploadDocuments:", error);
    return {
      success: false,
      message: "Erro ao fazer upload dos documentos.",
    };
  }
}

"use server";

import { auth } from "@/auth";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { makeDeleteBacklogItemUseCase } from "@/useCases/backlog/factories/makeDeleteBacklogItemUseCase";

// Schema simples apenas para o ID, caso não queira criar um arquivo separado
const deleteBacklogSchema = z.object({
  id: z.cuid("ID do backlog inválido"),
});

type DeleteBacklogType = z.infer<typeof deleteBacklogSchema>;

export async function deleteBacklogAction(data: DeleteBacklogType) {
  // 1. Autenticação
  const session = await auth();
  if (!session?.user?.organizationId) {
    return {
      success: false,
      message: "Sessão expirada.",
    };
  }

  // 2. Validação
  const parsed = deleteBacklogSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      message: "ID inválido.",
    };
  }

  const { id } = parsed.data;

  try {
    // 3. Instanciação
    const deleteBacklogUseCase = makeDeleteBacklogItemUseCase();

    // 4. Execução
    await deleteBacklogUseCase.execute({
      id,
      userId: session.user.id,
    });

    // 5. Revalidação
    revalidatePath("/dashboard/backlogs");

    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        message: error.message, // Ex: "Backlog não encontrado"
      };
    }

    return {
      success: false,
      message: "Erro interno ao excluir backlog.",
    };
  }
}

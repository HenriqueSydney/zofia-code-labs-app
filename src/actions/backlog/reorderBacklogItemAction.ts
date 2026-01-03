"use server";

import { auth } from "@/auth";
import {
  reorderBacklogItemSchema,
  ReorderBacklogItemType,
} from "@/schemas/backlog/reorderBacklogItemSchema";
import { makeReorderBacklogItemUseCase } from "@/useCases/backlog/factories/makeReorderBacklogItemUseCase";
import { revalidatePath } from "next/cache";

export async function reorderBacklogItemAction(data: ReorderBacklogItemType) {
  // 1. Autenticação
  const session = await auth();
  if (!session?.user?.organizationId) {
    return {
      success: false,
      message: "Sessão expirada ou usuário sem organização vinculada.",
    };
  }

  // 2. Validação Zod
  const parsed = reorderBacklogItemSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      message:
        parsed.error.issues[0].message || "Dados inválidos para atualização.",
    };
  }

  const { id, allSortedIds, newPositionIndex, status } = parsed.data;

  try {
    // 3. Instanciação
    const reorderBacklogUseCase = makeReorderBacklogItemUseCase();

    // 4. Execução
    // O UseCase deve verificar se o backlog pertence à organizationId antes de atualizar
    await reorderBacklogUseCase.execute({
      allSortedIds,
      id,
      newPositionIndex,
      userId: session.user.id,
      status
    });

    // 5. Revalidação
    revalidatePath("/dashboard/backlogs");

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
      message: "Erro interno ao atualizar backlog.",
    };
  }
}

"use server";

import { resolveActionErrorMessage, resolveSuccessMessage, serverErrorMessage } from "@/errors/resolveActionErrorMessage";
import { auth } from "@/auth";
import {
  reorderDefaultBacklogItemSchema,
  ReorderDefaultBacklogItemType,
} from "@/schemas/services/backlog/reorderDefaultBacklogItemSchema";
import { makeReorderServiceDefaultBacklogsItemsUseCase } from "@/useCases/services/backlogs/factories/makeReorderServiceDefaultBacklogItemUseCase";
import { revalidatePath } from "next/cache";

export async function reorderServiceDefaultBacklogItemAction(
  serviceTypeId: string,
  data: ReorderDefaultBacklogItemType,
) {
  // 1. Autenticação
  const session = await auth();
  if (!session?.user?.organizationId) {
    return {
      success: false,
      message: await serverErrorMessage("sessionExpiredNoOrg"),
    };
  }

  // 2. Validação Zod
  const parsed = reorderDefaultBacklogItemSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      message:
        parsed.error.issues[0].message || await serverErrorMessage("invalidData"),
    };
  }

  const { id, allSortedIds, newPositionIndex } = parsed.data;

  try {
    // 3. Instanciação
    const reorderBacklogUseCase =
      makeReorderServiceDefaultBacklogsItemsUseCase();

    // 4. Execução
    // O UseCase deve verificar se o backlog pertence à organizationId antes de atualizar
    await reorderBacklogUseCase.execute({
      allSortedIds,
      id,
      newPositionIndex,
      userId: session.user.id,
    });

    revalidatePath(`settings/services/catalog/${serviceTypeId}/`);

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
      message: await serverErrorMessage("backlogUpdateFailed"),
    };
  }
}

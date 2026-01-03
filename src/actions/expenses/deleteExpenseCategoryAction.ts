"use server";

import { auth } from "@/auth";
import { makeDeleteExpenseCategoryUseCase } from "@/useCases/expenses/factories/makeDeleteExpenseCategoryUseCase";
import { revalidatePath } from "next/cache";

export async function deleteExpenseCategoryAction(id: string) {
  const session = await auth();

  if (!session?.user?.organizationId) {
    return { success: false, message: "Sessão expirada." };
  }

  try {
    const deleteUseCase = makeDeleteExpenseCategoryUseCase();

    await deleteUseCase.execute({
      id,
      userId: session.user.id,
      organizationId: session.user.organizationId,
    });

    revalidatePath("/settings/expenses");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Erro ao remover categoria.",
    };
  }
}

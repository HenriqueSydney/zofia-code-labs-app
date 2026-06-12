"use server";

import { resolveActionErrorMessage, resolveSuccessMessage, serverErrorMessage } from "@/errors/resolveActionErrorMessage";
import { auth } from "@/auth";
import { expenseCategorySchema } from "@/schemas/expenses/expenseCategorySchema";
import { makeCreateExpenseCategoryUseCase } from "@/useCases/expenses/factories/makeCreateExpenseCategoryUseCase";
import { revalidatePath } from "next/cache";

export async function createExpenseCategoryAction(data: unknown) {
  const session = await auth();

  if (!session?.user?.organizationId) {
    return {
      success: false,
      message: await serverErrorMessage("sessionExpiredNoOrg"),
    };
  }

  const parsed = expenseCategorySchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0].message || await serverErrorMessage("invalidData"),
    };
  }

  try {
    const createUseCase = makeCreateExpenseCategoryUseCase();

    await createUseCase.execute({
      organizationId: session.user.organizationId,
      userId: session.user.id,
      ...parsed.data,
    });

    revalidatePath("/settings/expenses"); // Ajuste conforme sua rota
    return { success: true };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Erro interno ao criar categoria.",
    };
  }
}

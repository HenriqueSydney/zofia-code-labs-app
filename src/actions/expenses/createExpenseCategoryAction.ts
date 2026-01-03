"use server";

import { auth } from "@/auth";
import { expenseCategorySchema } from "@/schemas/expenses/expenseCategorySchema";
import { makeCreateExpenseCategoryUseCase } from "@/useCases/expenses/factories/makeCreateExpenseCategoryUseCase";
import { revalidatePath } from "next/cache";

export async function createExpenseCategoryAction(data: unknown) {
  const session = await auth();

  if (!session?.user?.organizationId) {
    return {
      success: false,
      message: "Sessão expirada ou usuário sem organização.",
    };
  }

  const parsed = expenseCategorySchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0].message || "Dados inválidos.",
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

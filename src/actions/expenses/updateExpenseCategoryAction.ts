"use server";

import { resolveActionErrorMessage, resolveSuccessMessage, serverErrorMessage } from "@/errors/resolveActionErrorMessage";
import { auth } from "@/auth";
import { updateExpenseCategorySchema } from "@/schemas/expenses/expenseCategorySchema";
import { makeUpdateExpenseCategoryUseCase } from "@/useCases/expenses/factories/makeUpdateExpenseCategoryUseCase";
import { revalidatePath } from "next/cache";

export async function updateExpenseCategoryAction(data: unknown) {
  const session = await auth();

  if (!session?.user?.organizationId) {
    return { success: false, message: await serverErrorMessage("sessionExpired") };
  }

  const parsed = updateExpenseCategorySchema.safeParse(data);

  if (!parsed.success) {
    return { success: false, message: await serverErrorMessage("expenseUpdateInvalidData") };
  }

  const { id, ...rest } = parsed.data;

  try {
    const updateUseCase = makeUpdateExpenseCategoryUseCase();

    await updateUseCase.execute({
      id,
      userId: session.user.id,
      organizationId: session.user.organizationId,
      data: rest,
    });

    revalidatePath("/settings/expenses");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: await resolveActionErrorMessage(error),
    };
  }
}

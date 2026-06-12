"use server";

import { resolveActionErrorMessage, resolveSuccessMessage, serverErrorMessage } from "@/errors/resolveActionErrorMessage";
import { auth } from "@/auth";
import { makeDeleteExpenseUseCase } from "@/useCases/expenses/factories/makeDeleteExpenseUseCase";
import { revalidatePath } from "next/cache";

export async function deleteExpenseAction(
  expenseId: string,
  projectSlug: string
) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: await serverErrorMessage("unauthorized") };

  try {
    const useCase = makeDeleteExpenseUseCase();

    await useCase.execute({
      expenseId,
      userId: session.user.id,
    });

    revalidatePath(`/projects/${projectSlug}/financial`);
    return { success: true, message: await resolveSuccessMessage("expenseRemoved") };
  } catch (error) {
    return { success: false, message: await resolveActionErrorMessage(error) };
  }
}

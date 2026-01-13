"use server";

import { auth } from "@/auth";
import { handleErrors } from "@/errors/handleErrors";
import { makeDeleteExpenseUseCase } from "@/useCases/expenses/factories/makeDeleteExpenseUseCase";
import { revalidatePath } from "next/cache";

export async function deleteExpenseAction(
  expenseId: string,
  projectSlug: string
) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: "Não autorizado" };

  try {
    const useCase = makeDeleteExpenseUseCase();

    await useCase.execute({
      expenseId,
      userId: session.user.id,
    });

    revalidatePath(`/projects/${projectSlug}/financial`);
    return { success: true, message: "Despesa removida." };
  } catch (error) {
    return { success: false, message: handleErrors(error) };
  }
}

"use server";

import { resolveActionErrorMessage, resolveSuccessMessage, serverErrorMessage } from "@/errors/resolveActionErrorMessage";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import {
  UpdateExpenseFormData,
  updateExpenseSchema,
} from "@/schemas/expenses/expenseSchema";
import { makeUpdateExpenseUseCase } from "@/useCases/expenses/factories/makeUpdateExpenseUseCase";

export async function updateExpenseAction(
  expenseId: string,
  projectSlug: string,
  data: UpdateExpenseFormData
) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: await serverErrorMessage("unauthorized") };

  // Usamos o schema parcial aqui
  const validation = updateExpenseSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, message: validation.error.issues[0].message };
  }

  try {
    const useCase = makeUpdateExpenseUseCase();

    await useCase.execute({
      expenseId,
      userId: session.user.id,
      data: validation.data, // Passa apenas os campos validados
    });

    revalidatePath(`/projects/${projectSlug}/financial`);
    return { success: true, message: await resolveSuccessMessage("expenseUpdated") };
  } catch (error) {
    return { success: false, message: await resolveActionErrorMessage(error) };
  }
}

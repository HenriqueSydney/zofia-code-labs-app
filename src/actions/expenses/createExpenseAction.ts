"use server";

import { resolveActionErrorMessage, resolveSuccessMessage, serverErrorMessage } from "@/errors/resolveActionErrorMessage";
import { auth } from "@/auth";
import {
  ExpenseFormData,
  expenseSchema,
} from "@/schemas/expenses/expenseSchema";
import { makeCreateExpenseUseCase } from "@/useCases/expenses/factories/makeCreateExpenseUseCase";
import { revalidatePath } from "next/cache";

export async function createExpenseAction(
  projectSlug: string,
  data: ExpenseFormData
) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: await serverErrorMessage("unauthorized") };

  const validation = expenseSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, message: validation.error.issues[0].message };
  }

  try {
    const useCase = makeCreateExpenseUseCase();

    await useCase.execute({
      ...validation.data,
      projectSlug,
      userId: session.user.id,
      // O UseCase já trata a conversão de tipos baseado no que definimos antes,
      // mas como o Zod já entrega Date e Number corretos, o fluxo segue limpo.
    });

    revalidatePath(`/projects/${projectSlug}/financial`);
    return { success: true, message: await resolveSuccessMessage("expenseCreated") };
  } catch (error) {
    return { success: false, message: await resolveActionErrorMessage(error) };
  }
}

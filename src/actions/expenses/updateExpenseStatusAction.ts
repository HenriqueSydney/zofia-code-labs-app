"use server";

import { resolveActionErrorMessage, resolveSuccessMessage, serverErrorMessage } from "@/errors/resolveActionErrorMessage";
import { auth } from "@/auth";
import { ExpenseStatusSchema } from "@/schemas/expenses/expenseSchema";
import { makeUpdateExpenseStatusUseCase } from "@/useCases/expenses/factories/makeUpdateExpenseStatusUseCase";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Schema simples apenas para essa action
const statusActionSchema = z.object({
  status: ExpenseStatusSchema,
  paidAt: z.coerce.date().optional(), // Se for pagar, pode enviar a data
});

export async function updateExpenseStatusAction(
  expenseId: string,
  projectSlug: string,
  newStatus: string, // Recebe como string e valida no Zod
  paidAt?: Date
) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: await serverErrorMessage("unauthorized") };

  const validation = statusActionSchema.safeParse({
    status: newStatus,
    paidAt,
  });
  if (!validation.success) {
    return { success: false, message: await serverErrorMessage("invalidStatus") };
  }

  try {
    const useCase = makeUpdateExpenseStatusUseCase();

    await useCase.execute({
      expenseId,
      userId: session.user.id,
      status: validation.data.status,
      paidAt: validation.data.paidAt,
    });

    revalidatePath(`/projects/${projectSlug}/financial`);
    return { success: true, message: await resolveSuccessMessage("statusUpdated") };
  } catch (error) {
    return { success: false, message: await resolveActionErrorMessage(error) };
  }
}

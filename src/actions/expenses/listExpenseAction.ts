"use server";

import { resolveActionErrorMessage, resolveSuccessMessage, serverErrorMessage } from "@/errors/resolveActionErrorMessage";
import { auth } from "@/auth";
import { makeListExpenseUseCase } from "@/useCases/expenses/factories/makeListExpenseUseCase";
import { z } from "zod";

// Schema para validar os filtros (query params)
const listExpensesSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  perPage: z.coerce.number().min(1).max(100).default(20),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export type ListExpensesParams = z.infer<typeof listExpensesSchema>;

export async function listExpensesAction(
  projectSlug: string,
  params?: ListExpensesParams
) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: await serverErrorMessage("unauthorized") };

  const validation = listExpensesSchema.safeParse(params ?? {});
  if (!validation.success) {
    return { success: false, message: await serverErrorMessage("invalidSearchParams") };
  }

  try {
    const useCase = makeListExpenseUseCase();

    const { expenses, total } = await useCase.execute({
      userId: session.user.id,
      projectSlug,
      ...validation.data,
    });

    return {
      success: true,
      data: {
        expenses,
        total,
      },
    };
  } catch (error) {
    return { success: false, message: await resolveActionErrorMessage(error) };
  }
}

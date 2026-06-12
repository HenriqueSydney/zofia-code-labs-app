// @/actions/financial/listInvoicesAction.ts
"use server";

import { resolveActionErrorMessage, resolveSuccessMessage, serverErrorMessage } from "@/errors/resolveActionErrorMessage";
import { auth } from "@/auth";
import { makeListInvoiceUseCase } from "@/useCases/financial/factories/makeListInvoiceUseCase";

export async function listInvoicesAction(projectSlug: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: await serverErrorMessage("unauthorized") };

  try {
    const useCase = makeListInvoiceUseCase();
    const invoices = await useCase.execute({
      projectSlug,
      userId: session.user.id,
    });

    return { success: true, data: invoices };
  } catch (error) {
    return { success: false, message: await resolveActionErrorMessage(error) };
  }
}

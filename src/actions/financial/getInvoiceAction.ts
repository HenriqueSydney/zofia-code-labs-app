// @/actions/financial/getInvoiceAction.ts
"use server";

import { resolveActionErrorMessage, resolveSuccessMessage, serverErrorMessage } from "@/errors/resolveActionErrorMessage";
import { auth } from "@/auth";
import { makeGetInvoiceUseCase } from "@/useCases/financial/factories/makeGetInvoiceUseCase";

export async function getInvoiceAction(invoiceId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: await serverErrorMessage("unauthorized") };

  try {
    const useCase = makeGetInvoiceUseCase();
    const invoice = await useCase.execute({
      id: invoiceId,
      userId: session.user.id,
    });

    return { success: true, data: invoice };
  } catch (error) {
    return { success: false, message: await resolveActionErrorMessage(error) };
  }
}

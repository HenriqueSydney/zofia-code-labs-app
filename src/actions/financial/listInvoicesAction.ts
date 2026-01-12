// @/actions/financial/listInvoicesAction.ts
"use server";

import { auth } from "@/auth";
import { handleErrors } from "@/errors/handleErrors";
import { makeListInvoiceUseCase } from "@/useCases/financial/factories/makeListInvoiceUseCase";

export async function listInvoicesAction(projectSlug: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: "Não autorizado" };

  try {
    const useCase = makeListInvoiceUseCase();
    const invoices = await useCase.execute({
      projectSlug,
      userId: session.user.id,
    });

    return { success: true, data: invoices };
  } catch (error) {
    return { success: false, message: handleErrors(error) };
  }
}

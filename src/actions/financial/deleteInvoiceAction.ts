// @/actions/financial/deleteInvoiceAction.ts
"use server";

import { auth } from "@/auth";
import { handleErrors } from "@/errors/handleErrors";
import { revalidatePath } from "next/cache";
import { makeDeleteInvoiceUseCase } from "@/useCases/financial/factories/makeDeleteInvoiceUseCase";

export async function deleteInvoiceAction(
  invoiceId: string,
  projectSlug: string
) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: "Não autorizado" };

  try {
    const useCase = makeDeleteInvoiceUseCase();
    await useCase.execute({
      id: invoiceId,
      userId: session.user.id,
    });

    revalidatePath(`/projects/${projectSlug}/financial`);
    return { success: true, message: "Fatura removida com sucesso!" };
  } catch (error) {
    return { success: false, message: handleErrors(error) };
  }
}

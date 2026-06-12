// @/actions/financial/deleteInvoiceAction.ts
"use server";

import { resolveActionErrorMessage, resolveSuccessMessage, serverErrorMessage } from "@/errors/resolveActionErrorMessage";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { makeDeleteInvoiceUseCase } from "@/useCases/financial/factories/makeDeleteInvoiceUseCase";

export async function deleteInvoiceAction(
  invoiceId: string,
  projectSlug: string
) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: await serverErrorMessage("unauthorized") };

  try {
    const useCase = makeDeleteInvoiceUseCase();
    await useCase.execute({
      id: invoiceId,
      userId: session.user.id,
    });

    revalidatePath(`/projects/${projectSlug}/financial`);
    return { success: true, message: await resolveSuccessMessage("invoiceDeleted") };
  } catch (error) {
    return { success: false, message: await resolveActionErrorMessage(error) };
  }
}

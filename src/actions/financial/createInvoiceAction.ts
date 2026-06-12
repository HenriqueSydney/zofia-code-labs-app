// @/actions/financial/createInvoiceAction.ts
"use server";

import { resolveActionErrorMessage, resolveSuccessMessage, serverErrorMessage } from "@/errors/resolveActionErrorMessage";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import {
  InvoiceFormData,
  invoiceSchema,
} from "@/schemas/financial/invoiceSchema";
import { makeCreateInvoiceUseCase } from "@/useCases/financial/factories/makeCreateInvoiceUseCase";

export async function createInvoiceAction(
  projectSlug: string,
  data: InvoiceFormData
) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: await serverErrorMessage("unauthorized") };

  const validation = invoiceSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, message: validation.error.issues[0].message };
  }

  try {
    const useCase = makeCreateInvoiceUseCase();
    await useCase.execute({
      ...validation.data,
      projectSlug,
      organizationId: session.user.organizationId,
      userId: session.user.id,
    });

    revalidatePath(`/projects/${projectSlug}/financial`);
    return { success: true, message: await resolveSuccessMessage("invoiceCreated") };
  } catch (error) {
    return { success: false, message: await resolveActionErrorMessage(error) };
  }
}

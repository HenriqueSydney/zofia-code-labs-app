// @/actions/financial/createInvoiceAction.ts
"use server";

import { auth } from "@/auth";
import { handleErrors } from "@/errors/handleErrors";
import { revalidatePath } from "next/cache";
import { invoiceSchema } from "@/schemas/financial/invoiceSchema";
import { makeCreateInvoiceUseCase } from "@/useCases/financial/factories/makeCreateInvoiceUseCase";

export async function createInvoiceAction(projectSlug: string, data: unknown) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: "Não autorizado" };

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
    return { success: true, message: "Fatura gerada com sucesso!" };
  } catch (error) {
    return { success: false, message: handleErrors(error) };
  }
}

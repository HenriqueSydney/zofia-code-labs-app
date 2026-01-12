// @/actions/financial/updateInvoiceAction.ts
"use server";

import { auth } from "@/auth";
import { handleErrors } from "@/errors/handleErrors";
import { revalidatePath } from "next/cache";
import { invoiceSchema } from "@/schemas/financial/invoiceSchema";
import { makeUpdateInvoiceUseCase } from "@/useCases/financial/factories/makeUpdateInvoiceUseCase";

export async function updateInvoiceAction(
  invoiceId: string,
  projectSlug: string,
  data: unknown
) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: "Não autorizado" };

  // Partial permite atualizar apenas alguns campos se necessário
  const validation = invoiceSchema.partial().safeParse(data);
  if (!validation.success) {
    return { success: false, message: validation.error.issues[0].message };
  }

  try {
    const useCase = makeUpdateInvoiceUseCase();
    await useCase.execute({
      id: invoiceId,
      userId: session.user.id,
      data: validation.data,
    });

    revalidatePath(`/projects/${projectSlug}/financial`);
    return { success: true, message: "Fatura atualizada com sucesso!" };
  } catch (error) {
    return { success: false, message: handleErrors(error) };
  }
}

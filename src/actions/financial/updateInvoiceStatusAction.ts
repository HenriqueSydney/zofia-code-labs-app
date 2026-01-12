"use server";

import { auth } from "@/auth";
import { handleErrors } from "@/errors/handleErrors";
import { revalidatePath } from "next/cache";
import { makeUpdateInvoiceStatusUseCase } from "@/useCases/financial/factories/makeUpdateInvoiceStatusUseCase";
import { FinancialStatus } from "@/generated/prisma/enums";

export async function updateInvoiceStatusAction(
  invoiceId: string,
  projectSlug: string,
  status: FinancialStatus,
  paidAt?: Date | null // Adicionado aqui
) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: "Não autorizado" };

  try {
    const useCase = makeUpdateInvoiceStatusUseCase();

    await useCase.execute({
      id: invoiceId,
      userId: session.user.id,
      status,
      paidAt,
    });

    revalidatePath(`/projects/${projectSlug}/financial`);
    return { success: true, message: "Status atualizado!" };
  } catch (error) {
    return { success: false, message: handleErrors(error) };
  }
}

"use server";

import { auth } from "@/auth";
import { handleErrors } from "@/errors/handleErrors";
import { makeCancelProposalUseCase } from "@/useCases/proposal/factories/makeCancelProposalUseCase";
import { revalidatePath } from "next/cache";

export async function cancelProposalAction(proposalId: string) {
  const session = await auth();
  if (!session?.user) return { error: "Não autorizado" };

  const useCase = makeCancelProposalUseCase();
  try {
    const { clientSlug, projectSlug } = await useCase.execute({
      id: proposalId,
      userId: session.user.id,
    });

    revalidatePath(`/clients/${clientSlug}/projects/${projectSlug}`);
    revalidatePath(
      `/clients/${clientSlug}/projects/${projectSlug}/commercial/proposal`
    );
    return { success: true, message: "Proposta removida com sucesso." };
  } catch (error) {
    return { error: handleErrors(error) };
  }
}

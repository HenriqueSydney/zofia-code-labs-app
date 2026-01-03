"use server";

import { auth } from "@/auth";
import { makeCancelProposalUseCase } from "@/useCases/proposal/factories/makeCancelProposalUseCase";
import { revalidatePath } from "next/cache";

export async function cancelProposalAction(proposalId: string) {
  const session = await auth();
  if (!session?.user) return { error: "Não autorizado" };

  const useCase = makeCancelProposalUseCase();
  try {
    const { projectId } = await useCase.execute({
      id: proposalId,
      userId: session.user.id,
    });

    revalidatePath(`/clients/${client.slug}/projects/${slug}`);
    revalidatePath(
      `/clients/${client.slug}/projects/${slug}/commercial/proposal`
    );
    return { success: true, message: "Proposta removida com sucesso." };
  } catch (error) {
    console.error(error);
    return { error: "Proposta removida com sucesso." };
  }
}

"use server";

import { resolveActionErrorMessage, resolveSuccessMessage, serverErrorMessage } from "@/errors/resolveActionErrorMessage";
import { auth } from "@/auth";
import { makeCancelProposalUseCase } from "@/useCases/proposal/factories/makeCancelProposalUseCase";
import { revalidatePath } from "next/cache";

export async function cancelProposalAction(proposalId: string) {
  const session = await auth();
  if (!session?.user) return { error: await serverErrorMessage("unauthorized") };

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
    return { success: true, message: await resolveSuccessMessage("proposalRemoved") };
  } catch (error) {
    return { error: await resolveActionErrorMessage(error) };
  }
}

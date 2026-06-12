"use server";

import { resolveActionErrorMessage, resolveSuccessMessage, serverErrorMessage } from "@/errors/resolveActionErrorMessage";
import { auth } from "@/auth";
import { makeCancelContractUseCase } from "@/useCases/contract/factories/makeCancelContractUseCase";
import { revalidatePath } from "next/cache";

export async function cancelContractAction(contractId: string) {
  const session = await auth();
  if (!session?.user) return { error: await serverErrorMessage("unauthorized") };

  const useCase = makeCancelContractUseCase();
  try {
    const { slug, clientSlug } = await useCase.execute({
      id: contractId,
      userId: session.user.id,
    });

    revalidatePath(`/clients/${clientSlug}/projects/${slug}`);
    revalidatePath(
      `/clients/${clientSlug}/projects/${slug}/commercial/contract`,
    );
    return { success: true, message: await resolveSuccessMessage("contractDeleted") };
  } catch (error) {
    return { error: await resolveActionErrorMessage(error) };
  }
}

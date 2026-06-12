"use server";

import { resolveActionErrorMessage, resolveSuccessMessage, serverErrorMessage } from "@/errors/resolveActionErrorMessage";
import { auth } from "@/auth";
import { ValidationError } from "@/errors";
import { ContractStatus } from "@/generated/prisma/enums";
import { makeChangeContractStatus } from "@/useCases/contract/factories/makeChangeContractStatusUseCase";
import { revalidatePath } from "next/cache";

export async function changeContractStatusAction(
  contractId: string,
  newStatus: ContractStatus,
  communicationChannel?: "whatsapp" | "email" | "none",
) {
  const session = await auth();
  if (!session?.user) return { error: await serverErrorMessage("unauthorized") };

  const useCase = makeChangeContractStatus();

  if (
    communicationChannel &&
    !["whatsapp", "email", "none"].includes(communicationChannel)
  ) {
    throw new ValidationError("invalidCommunicationChannel");
  }

  try {
    const updatedContract = await useCase.execute({
      contractId,
      userId: session.user.id,
      newStatus,
      communicationChannel,
    });

    revalidatePath(
      `/clients/${updatedContract.project.client.slug}/projects/${updatedContract.project.slug}`,
    );
    revalidatePath(
      `/clients/${updatedContract.project.client.slug}/projects/${updatedContract.project.slug}/commercial/contracts`,
    );
    return { result: true, message: await resolveSuccessMessage("proposalAdvanced") };
  } catch (error) {
    return {
      error: await resolveActionErrorMessage(error),
    };
  }
}

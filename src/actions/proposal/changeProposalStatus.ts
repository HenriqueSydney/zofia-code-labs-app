"use server";

import { resolveActionErrorMessage, resolveSuccessMessage, serverErrorMessage } from "@/errors/resolveActionErrorMessage";
import { auth } from "@/auth";
import { ValidationError } from "@/errors";
import { ProposalStatus } from "@/generated/prisma/enums";
import { makeChangeProposalStatus } from "@/useCases/proposal/factories/makeChangeProposalStatusUseCase";
import { revalidatePath } from "next/cache";

export async function changeProposalStatusAction(
  proposalId: string,
  newStatus: ProposalStatus,
  communicationChannel?: "whatsapp" | "email" | "none",
  rejectFormDetails?: any,
) {
  const session = await auth();
  if (!session?.user) return { error: await serverErrorMessage("unauthorized") };

  const useCase = makeChangeProposalStatus();

  if (
    communicationChannel &&
    !["whatsapp", "email", "none"].includes(communicationChannel)
  ) {
    throw new ValidationError("invalidCommunicationChannel");
  }

  try {
    const updatedProposal = await useCase.execute({
      proposalId,
      userId: session.user.id,
      newStatus,
      communicationChannel,
      rejectFormDetails
    });

    revalidatePath(`/projects/${updatedProposal.projectId}/project`);
    return { result: true, message: await resolveSuccessMessage("proposalAdvanced") };
  } catch (error) {
    return {
      error: await resolveActionErrorMessage(error),
    };
  }
}

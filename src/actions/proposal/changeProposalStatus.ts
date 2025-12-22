"use server";

import { auth } from "@/auth";
import { AppError } from "@/errors/AppError";
import { ProposalStatus } from "@/generated/prisma/enums";
import { makeChangeProposalStatus } from "@/useCases/proposal/factories/makeChangeProposalStatusUseCase";
import { revalidatePath } from "next/cache";

export async function changeProposalStatusAction(
  proposalId: string,
  newStatus: ProposalStatus,
  communicationChannel?: "whatsapp" | "email"
) {
  const session = await auth();
  if (!session?.user) return { error: "Não autorizado" };

  const useCase = makeChangeProposalStatus();

  if (
    communicationChannel &&
    !["whatsapp", "email"].includes(communicationChannel)
  ) {
    throw new AppError("Canal de comunicação inválido");
  }

  try {
    const updatedProposal = await useCase.execute({
      proposalId,
      userId: session.user.id,
      newStatus,
      communicationChannel
    });

    revalidatePath(`/projects/${updatedProposal.projectId}/project`);
    return { result: true, message: "Proposta encaminhada para próxima fase" };
  } catch (error) {
    console.error(error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "Erro ao encaminhar a proposta para próxima fase. Tente novamente mais tarde",
    };
  }
}

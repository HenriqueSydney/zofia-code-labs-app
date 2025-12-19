"use server";

import { auth } from "@/auth";
import { AppError } from "@/errors/AppError";
import { ProposalStatus } from "@/generated/prisma/enums";
import { makeChangeProposalStatus } from "@/useCases/proposal/factories/makeChangeProposalStatusUseCase";

export async function changeProposalStatusAction(
  proposalId: string,
  newStatus: ProposalStatus
) {
  const session = await auth();
  if (!session?.user) return { error: "Não autorizado" };

  const useCase = makeChangeProposalStatus();

  try {
    await useCase.execute({
      proposalId,
      userId: session.user.id,
      newStatus,
    });

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

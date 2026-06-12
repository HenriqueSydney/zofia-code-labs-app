"use server";

import { auth } from "@/auth";
import { ValidationError } from "@/errors";
import { makeGetProposalByIdUseCase } from "@/useCases/proposal/factories/makeGetProposalByIdUseCase";

export async function getProposalAction(proposalId: string) {
  const session = await auth();
  if (!session?.user) throw new ValidationError("unauthorized", { statusCode: 401, severity: "low" });

  const useCase = makeGetProposalByIdUseCase();

  try {
    const proposal = await useCase.execute({
      id: proposalId,
      userId: session.user.id,
    });

    return proposal;
  } catch (error) {
    console.error(error);
    throw new ValidationError("Erro ao localizar a proposta vigente.");
  }
}

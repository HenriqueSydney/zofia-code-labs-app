"use server";

import { auth } from "@/auth";
import { ValidationError } from "@/errors";
import { makeGetContractByIdUseCase } from "@/useCases/contract/factories/makeGetContractByIdUseCase";

export async function getContractAction(contractId: string) {
  const session = await auth();
  if (!session?.user) throw new ValidationError("unauthorized", { statusCode: 401, severity: "low" });

  const useCase = makeGetContractByIdUseCase();

  try {
    const contract = await useCase.execute({
      id: contractId,
      userId: session.user.id,
    });

    return contract;
  } catch (error) {
    console.error(error);
    throw new ValidationError("Erro ao localizar a proposta vigente.");
  }
}

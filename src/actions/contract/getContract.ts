"use server";

import { auth } from "@/auth";
import { AppError } from "@/errors/AppError";
import { makeGetContractByIdUseCase } from "@/useCases/contract/factories/makeGetContractByIdUseCase";

export async function getContractAction(contractId: string) {
  const session = await auth();
  if (!session?.user) throw new AppError("Não autorizado");

  const useCase = makeGetContractByIdUseCase();

  try {
    const contract = await useCase.execute({
      id: contractId,
      userId: session.user.id,
    });

    return contract;
  } catch (error) {
    console.error(error);
    throw new AppError("Erro ao localizar a proposta vigente.");
  }
}

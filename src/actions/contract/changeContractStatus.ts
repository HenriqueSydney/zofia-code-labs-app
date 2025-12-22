"use server";

import { auth } from "@/auth";
import { AppError } from "@/errors/AppError";
import { ContractStatus } from "@/generated/prisma/enums";
import { makeChangeContractStatus } from "@/useCases/contract/factories/makeChangeContractStatusUseCase";
import { revalidatePath } from "next/cache";

export async function changeContractStatusAction(
  contractId: string,
  newStatus: ContractStatus,
  communicationChannel?: "whatsapp" | "email"
) {
  const session = await auth();
  if (!session?.user) return { error: "Não autorizado" };

  const useCase = makeChangeContractStatus();

  if (
    communicationChannel &&
    !["whatsapp", "email"].includes(communicationChannel)
  ) {
    throw new AppError("Canal de comunicação inválido");
  }

  try {
    const updatedContract = await useCase.execute({
      contractId,
      userId: session.user.id,
      newStatus,
      communicationChannel
    });

    revalidatePath(`/projects/${updatedContract.projectId}/project`);
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

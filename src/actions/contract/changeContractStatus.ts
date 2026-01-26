"use server";

import { auth } from "@/auth";
import { AppError } from "@/errors/AppError";
import { handleErrors } from "@/errors/handleErrors";
import { ContractStatus } from "@/generated/prisma/enums";
import { makeChangeContractStatus } from "@/useCases/contract/factories/makeChangeContractStatusUseCase";
import { revalidatePath } from "next/cache";

export async function changeContractStatusAction(
  contractId: string,
  newStatus: ContractStatus,
  communicationChannel?: "whatsapp" | "email",
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
      communicationChannel,
    });

    revalidatePath(
      `/clients/${updatedContract.project.client.slug}/projects/${updatedContract.project.slug}`,
    );
    revalidatePath(
      `/clients/${updatedContract.project.client.slug}/projects/${updatedContract.project.slug}/commercial/contracts`,
    );
    return { result: true, message: "Proposta encaminhada para próxima fase" };
  } catch (error) {
    return {
      error: handleErrors(error),
    };
  }
}

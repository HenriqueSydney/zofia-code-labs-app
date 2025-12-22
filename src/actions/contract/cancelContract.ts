"use server";

import { auth } from "@/auth";
import { makeCancelContractUseCase } from "@/useCases/contract/factories/makeCancelContractUseCase";
import { revalidatePath } from "next/cache";

export async function cancelContractAction(contractId: string) {
  const session = await auth();
  if (!session?.user) return { error: "Não autorizado" };

  const useCase = makeCancelContractUseCase();
  try {
    const { projectId } = await useCase.execute({
      id: contractId,
      userId: session.user.id,
    });

    revalidatePath(`/projects/${projectId}/project`);
    revalidatePath(`/projects/${projectId}/project/commercial/contract`);
    return { success: true, message: "Contrato removida com sucesso." };
  } catch (error) {
    console.error(error);
    return { error: "Contrato removida com sucesso." };
  }
}

"use server";

import { auth } from "@/auth";
import { AppError } from "@/errors/AppError";
import { handleErrors } from "@/errors/handleErrors";
import { makeConnectServiceToProjectUseCase } from "@/useCases/integration/factories/makeConnectServiceToProjectUseCase";
import { revalidatePath } from "next/cache";

export async function connectProjectToServiceAction(
  client: string,
  serviceId: string,
  projectSlug: string,
  data: any
) {
  const session = await auth();

  // Aqui você verificaria se o usuário é o ADMIN do sistema
  if (!session?.user) {
    throw new AppError("Não autorizado.");
  }

  try {
    const useCase = makeConnectServiceToProjectUseCase();

    await useCase.execute({
      projectSlug,
      serviceId,
      userId: session.user.id,
      data,
    });

    revalidatePath(`/clients/${client}/projects/${projectSlug}/metrics`);
    return { success: true, message: "Serviço conectado com sucesso" };
  } catch (error) {
    const message = handleErrors(error);
    return { success: false, message };
  }
}

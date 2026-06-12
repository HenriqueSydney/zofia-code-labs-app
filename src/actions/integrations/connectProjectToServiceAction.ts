"use server";

import { resolveActionErrorMessage, resolveSuccessMessage, serverErrorMessage } from "@/errors/resolveActionErrorMessage";
import { auth } from "@/auth";
import { UnauthorizedError } from "@/errors";
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
    throw new UnauthorizedError("unauthorized");
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
    return { success: true, message: await resolveSuccessMessage("serviceConnected") };
  } catch (error) {
    const message = await resolveActionErrorMessage(error);
    return { success: false, message };
  }
}

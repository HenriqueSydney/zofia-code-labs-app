"use server";

import { resolveActionErrorMessage, resolveSuccessMessage, serverErrorMessage } from "@/errors/resolveActionErrorMessage";
import { auth } from "@/auth";
import { makeDeleteClientUseCase } from "@/useCases/clients/factories/makeDeleteClientUseCase";
import { revalidatePath } from "next/cache";

export async function deleteClientAction(clientId: string) {
  const session = await auth();

  if (!session?.user) return { success: false, message: await serverErrorMessage("unauthorized") };

  try {
    const useCase = makeDeleteClientUseCase();

    await useCase.execute({
      id: clientId,
      userId: session.user.id,
      memberRole: session.user.memberRole,
    });

    revalidatePath("/clients");
    return { success: true, message: await resolveSuccessMessage("clientDeleted") };
  } catch (error) {
    const message = await resolveActionErrorMessage(error);
    return {
      success: false,
      message: message,
    };
  }
}

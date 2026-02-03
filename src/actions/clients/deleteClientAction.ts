"use server";

import { auth } from "@/auth";
import { handleErrors } from "@/errors/handleErrors";
import { makeDeleteClientUseCase } from "@/useCases/clients/factories/makeDeleteClientUseCase";
import { revalidatePath } from "next/cache";

export async function deleteClientAction(clientId: string) {
  const session = await auth();

  if (!session?.user) return { success: false, message: "Não autorizado" };

  try {
    const useCase = makeDeleteClientUseCase();

    await useCase.execute(clientId, session.user.id);

    revalidatePath("/clients");
    return { success: true, message: "Cliente removido com sucesso!" };
  } catch (error) {
    const message = handleErrors(error);
    return {
      success: false,
      message: message,
    };
  }
}

'use server'

import { makeDeleteClientUseCase } from "@/useCases/clients/factories/makeDeleteClientUseCase";
import { revalidatePath } from "next/cache";

export async function deleteClientAction(clientId: string) {
  try {
    const useCase = makeDeleteClientUseCase();

    await useCase.execute(clientId);

    revalidatePath("/clients");
    return { success: true, message: "Cliente removido com sucesso!" };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message:
        "Erro ao remover cliente. Verifique se ele possui projetos vinculados.",
    };
  }
}

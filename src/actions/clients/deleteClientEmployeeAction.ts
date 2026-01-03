"use server";

import { revalidatePath } from "next/cache";
import { makeDeleteClientEmployeeUseCase } from "@/useCases/clients/factories/makeDeleteClientEmployeeUseCase";
import { auth } from "@/auth";
import { AppError } from "@/errors/AppError";

export async function deleteClientEmployeeAction(
  employeeId: string,
  clientSlug: string
) {
  try {
    const session = await auth();
    if (!session?.user) throw new AppError("Não autorizado");

    const useCase = makeDeleteClientEmployeeUseCase();

    await useCase.execute(session.user.id, employeeId);

    revalidatePath(`/clients/${clientSlug}`);
    return { success: true, message: "Funcionário removido (inativado)." };
  } catch (error) {
    return { success: false, message: "Erro ao remover funcionário." };
  }
}

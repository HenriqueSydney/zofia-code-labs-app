"use server";

import { auth } from "@/auth";
import { AppError } from "@/errors/AppError";
import { makeListClientEmployeeUseCase } from "@/useCases/clients/factories/makeListClientEmployeeUseCase";

export async function fetchClientEmployeesAction(slug: string) {
  try {
    const session = await auth();
    if (!session?.user) throw new AppError("Não autorizado");

    const useCase = makeListClientEmployeeUseCase();
    const employees = await useCase.execute(session.user.id, slug);

    return { success: true, employees };
  } catch (error) {
    return { success: false, employees: [], message: "Erro ao listar." };
  }
}

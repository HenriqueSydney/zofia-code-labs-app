"use server";

import { auth } from "@/auth";
import { AppError } from "@/errors/AppError";

import { makeGetProjectUseCase } from "@/useCases/projects/factories/makeGetProjectUseCase";

export async function getProjectAction(projectId: string) {
  try {
    const session = await auth();
    if (!session?.user) throw new AppError("Usuário não autenticado");

    const useCase = makeGetProjectUseCase();


    return await useCase.execute({ projectId, userId: session.user.id });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Erro ao localizar o projeto");
  }
}

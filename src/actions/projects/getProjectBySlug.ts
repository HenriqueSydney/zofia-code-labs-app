"use server";

import { auth } from "@/auth";
import { AppError } from "@/errors/AppError";
import { makeGetProjectBySlugUseCase } from "@/useCases/projects/factories/makeGetProjectBySlugUseCase";

export async function getProjectBySlugAction(slug: string) {
  try {
    const session = await auth();
    if (!session?.user) throw new AppError("Usuário não autenticado");

    const useCase = makeGetProjectBySlugUseCase();

    return await useCase.execute({ slug, userId: session.user.id });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Erro ao localizar o projeto");
  }
}

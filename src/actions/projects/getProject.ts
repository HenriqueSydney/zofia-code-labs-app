"use server";

import { resolveActionErrorMessage, resolveSuccessMessage, serverErrorMessage } from "@/errors/resolveActionErrorMessage";
import { auth } from "@/auth";
import { AppError, UnauthorizedError, ValidationError } from "@/errors";

import { makeGetProjectUseCase } from "@/useCases/projects/factories/makeGetProjectUseCase";

export async function getProjectAction(projectId: string) {
  try {
    const session = await auth();
    if (!session?.user) throw new UnauthorizedError(await serverErrorMessage("unauthenticated"));

    const useCase = makeGetProjectUseCase();


    return await useCase.execute({ projectId, userId: session.user.id });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new ValidationError("Erro ao localizar o projeto");
  }
}

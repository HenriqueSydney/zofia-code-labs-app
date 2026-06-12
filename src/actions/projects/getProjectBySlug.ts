"use server";

import { resolveActionErrorMessage, resolveSuccessMessage, serverErrorMessage } from "@/errors/resolveActionErrorMessage";
import { auth } from "@/auth";
import { AppError, UnauthorizedError, ValidationError } from "@/errors";
import { makeGetProjectBySlugUseCase } from "@/useCases/projects/factories/makeGetProjectBySlugUseCase";

export async function getProjectBySlugAction(slug: string) {
  try {
    const session = await auth();
    if (!session?.user) throw new UnauthorizedError(await serverErrorMessage("unauthenticated"));

    const useCase = makeGetProjectBySlugUseCase();

    return await useCase.execute({ slug, userId: session.user.id });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new ValidationError("Erro ao localizar o projeto");
  }
}

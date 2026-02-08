"use server";

import { auth } from "@/auth";
import { AppError } from "@/errors/AppError";
import { makeGetClientProjectPipelineUseCase } from "@/useCases/clients/factories/makeGetClientProjectPipelineUseCase";

export async function getClientProjectPipelineAction(slug: string) {
  const session = await auth();

  if (!session) {
    throw new AppError("Usuário não logado.");
  }

  const useCase = makeGetClientProjectPipelineUseCase();

  const { projectPipelineMetric } = await useCase.execute({
    userId: session.user.id,
    slug,
  });

  return projectPipelineMetric;
}

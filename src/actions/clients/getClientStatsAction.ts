"use server";

import { auth } from "@/auth";
import { AppError } from "@/errors/AppError";
import { makeGetClientProjectPipelineUseCase } from "@/useCases/clients/factories/makeGetClientProjectPipelineUseCase";
import { makeGetClientStatsUseCase } from "@/useCases/clients/factories/makeGetClientStatsUseCase";

export async function getClientStatsAction(slug: string) {
  const session = await auth();

  if (!session) {
    throw new AppError("Usuário não logado.");
  }

  const useCase = makeGetClientStatsUseCase();

  const { clientStats } = await useCase.execute({
    userId: session.user.id,
    slug,
  });

  return clientStats;
}

"use server";

import { auth } from "@/auth";
import { UnauthorizedError } from "@/errors";
import { makeGetClientProjectPipelineUseCase } from "@/useCases/clients/factories/makeGetClientProjectPipelineUseCase";
import { makeGetClientStatsUseCase } from "@/useCases/clients/factories/makeGetClientStatsUseCase";

export async function getClientStatsAction(slug: string) {
  const session = await auth();

  if (!session) {
    throw new UnauthorizedError("notLoggedIn");
  }

  const useCase = makeGetClientStatsUseCase();

  const { clientStats } = await useCase.execute({
    userId: session.user.id,
    slug,
    memberRole: session.user.memberRole,
  });

  return clientStats;
}

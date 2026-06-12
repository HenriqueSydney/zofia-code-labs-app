"use server";

import { auth } from "@/auth";
import { UnauthorizedError } from "@/errors";
import { makeGetClientProjectPipelineUseCase } from "@/useCases/clients/factories/makeGetClientProjectPipelineUseCase";

export async function getClientProjectPipelineAction(slug: string) {
  const session = await auth();

  if (!session) {
    throw new UnauthorizedError("notLoggedIn");
  }

  const useCase = makeGetClientProjectPipelineUseCase();

  const { projectPipelineMetric } = await useCase.execute({
    userId: session.user.id,
    slug,
    memberRole: session.user.memberRole,
  });

  return projectPipelineMetric;
}

"use server";

import { auth } from "@/auth";
import { UnauthorizedError } from "@/errors";
import { makeGetClientBlockersUseCase } from "@/useCases/clients/factories/makeGetClientBlockersUseCase";

export async function getClientBlockersAction(slug: string) {
  const session = await auth();

  if (!session) {
    throw new UnauthorizedError("notLoggedIn");
  }

  const useCase = makeGetClientBlockersUseCase();

  const { blockerItens } = await useCase.execute({
    userId: session.user.id,
    slug,
    memberRole: session.user.memberRole,
  });

  return blockerItens;
}

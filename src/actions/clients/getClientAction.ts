"use server";

import { auth } from "@/auth";
import { UnauthorizedError } from "@/errors";
import { makeGetClientUseCase } from "@/useCases/clients/factories/makeGetClientUseCase";

export async function getClientAction(slug: string) {
  const session = await auth();

  if (!session) {
    throw new UnauthorizedError("notLoggedIn");
  }

  const fetchClientUseCase = makeGetClientUseCase();

  const clients = await fetchClientUseCase.execute({
    userId: session.user.id,
    slug,
    memberRole: session.user.memberRole,
  });

  return clients;
}

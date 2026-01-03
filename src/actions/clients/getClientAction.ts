"use server";

import { auth } from "@/auth";
import { AppError } from "@/errors/AppError";
import { makeGetClientUseCase } from "@/useCases/clients/factories/makeGetClientUseCase";

export async function getClientAction(slug: string) {
  const session = await auth();

  if (!session) {
    throw new AppError("Usuário não logado.");
  }

  const fetchClientUseCase = makeGetClientUseCase();

  const clients = await fetchClientUseCase.execute({
    userId: session.user.id,
    slug,
  });

  return clients;
}

"use server";

import { auth } from "@/auth";
import { AppError } from "@/errors/AppError";
import { makeFetchClientUseCase } from "@/useCases/clients/factories/makeFetchClientUseCase";

export async function fetchClientsAction(query?: string) {
  const session = await auth();

  if (!session) {
    throw new AppError("Usuário não logado.");
  }

  const { user } = session;
  const fetchClientUseCase = makeFetchClientUseCase();

  const clients = await fetchClientUseCase.execute({
    organizationId: user.organizationId,
    query,
  });

  return clients;
}

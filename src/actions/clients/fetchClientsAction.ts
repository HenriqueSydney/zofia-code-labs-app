"use server";

import { auth } from "@/auth";
import { ValidationError } from "@/errors";
import { makeFetchClientUseCase } from "@/useCases/clients/factories/makeFetchClientUseCase";

export async function fetchClientsAction(query?: string) {
  const session = await auth();

  if (!session) {
    throw new ValidationError("notLoggedIn", { statusCode: 401, severity: "low" });
  }

  const { user } = session;
  const fetchClientUseCase = makeFetchClientUseCase();

  const clients = await fetchClientUseCase.execute({
    organizationId: user.organizationId,
    query,
    userId: user.id,
  });

  return clients;
}

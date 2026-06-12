"use server";

import { auth } from "@/auth";
import { UnauthorizedError } from "@/errors";
import { makeFetchServiceUseCase } from "@/useCases/services/factories/makeFetchServiceTypeUseCase";

export async function fetchServiceTypeAction(query?: string) {
  const session = await auth();

  if (!session?.user?.organizationId) {
    throw new UnauthorizedError("sessionExpired");
  }

  const fetchServiceTypeUseCase = makeFetchServiceUseCase();

  const serviceTypes = await fetchServiceTypeUseCase.execute({
    query,
    userId: session.user.id,
    organizationId: session.user.organizationId,
  });

  return serviceTypes;
}

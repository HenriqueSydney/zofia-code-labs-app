"use server";

import { auth } from "@/auth";
import { UnauthorizedError } from "@/errors";
import { makeGetServiceUseCase } from "@/useCases/services/factories/makeGetServiceTypeUseCase";

export async function getServiceTypeAction(serviceId: string) {
  const session = await auth();

  if (!session?.user?.organizationId) {
    throw new UnauthorizedError("sessionExpired");
  }

  const fetchServiceTypeUseCase = makeGetServiceUseCase();

  const serviceType = await fetchServiceTypeUseCase.execute({
    serviceId,
    organizationId: session.user.organizationId,
    userId: session.user.id,
  });

  return serviceType;
}

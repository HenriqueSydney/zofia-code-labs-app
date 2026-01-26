"use server";

import { auth } from "@/auth";
import { AppError } from "@/errors/AppError";
import { makeGetServiceUseCase } from "@/useCases/services/factories/makeGetServiceTypeUseCase";

export async function getServiceTypeAction(serviceId: string) {
  const session = await auth();

  if (!session?.user?.organizationId) {
    throw new AppError("Usuário não autenticado");
  }

  const fetchServiceTypeUseCase = makeGetServiceUseCase();

  const serviceType = await fetchServiceTypeUseCase.execute({
    serviceId,
    organizationId: session.user.organizationId,
  });

  return serviceType;
}

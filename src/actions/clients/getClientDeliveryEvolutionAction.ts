"use server";

import { auth } from "@/auth";
import { AppError } from "@/errors/AppError";
import { makeGetClientDeliveryEvolutionUseCase } from "@/useCases/clients/factories/makeGetClientDeliveryEvolutionUseCase";

export async function getClientDeliveryEvolutionAction(slug: string) {
  const session = await auth();

  if (!session) {
    throw new AppError("Usuário não logado.");
  }

  const useCase = makeGetClientDeliveryEvolutionUseCase();

  const { deliveryEvolution } = await useCase.execute({
    userId: session.user.id,
    slug,
  });

  return deliveryEvolution;
}

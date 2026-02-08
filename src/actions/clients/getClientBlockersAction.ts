"use server";

import { auth } from "@/auth";
import { AppError } from "@/errors/AppError";
import { makeGetClientBlockersUseCase } from "@/useCases/clients/factories/makeGetClientBlockersUseCase";

export async function getClientBlockersAction(slug: string) {
  const session = await auth();

  if (!session) {
    throw new AppError("Usuário não logado.");
  }

  const useCase = makeGetClientBlockersUseCase();

  const { blockerItens } = await useCase.execute({
    userId: session.user.id,
    slug,
  });

  return blockerItens;
}

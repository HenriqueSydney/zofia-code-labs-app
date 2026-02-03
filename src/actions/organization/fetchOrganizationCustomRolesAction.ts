"use server";

import { auth } from "@/auth";
import { AppError } from "@/errors/AppError";
import { makeFetchOrganizationCustomRolesUseCase } from "@/useCases/organization/factories/makeFetchOrganizationCustomRolesUseCase";

export async function fetchOrganizationCustomRolesAction(
  organizationId: string,
) {
  const session = await auth();

  if (!session) {
    throw new AppError("Usuário não logado.", 401);
  }

  if (!organizationId) {
    throw new AppError("ID da organização é obrigatório.");
  }

  const useCase = makeFetchOrganizationCustomRolesUseCase();

  const { roles } = await useCase.execute({
    userId: session.user.id,
    organizationId,
  });

  // Serializa o retorno (importante para passar dados do Prisma para Client Components)
  return { roles };
}

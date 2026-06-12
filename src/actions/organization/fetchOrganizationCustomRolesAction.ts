"use server";

import { auth } from "@/auth";
import { UnauthorizedError, ValidationError } from "@/errors";
import { makeFetchOrganizationCustomRolesUseCase } from "@/useCases/organization/factories/makeFetchOrganizationCustomRolesUseCase";

export async function fetchOrganizationCustomRolesAction(
  organizationId: string,
) {
  const session = await auth();

  if (!session) {
    throw new UnauthorizedError("notLoggedIn");
  }

  if (!organizationId) {
    throw new ValidationError("ID da organização é obrigatório.");
  }

  const useCase = makeFetchOrganizationCustomRolesUseCase();

  const { roles } = await useCase.execute({
    userId: session.user.id,
    organizationId,
  });

  // Serializa o retorno (importante para passar dados do Prisma para Client Components)
  return { roles };
}

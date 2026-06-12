"use server";

import { auth } from "@/auth";
import { UnauthorizedError, ValidationError } from "@/errors";
import { makeFetchOrganizationMembersUseCase } from "@/useCases/organization/factories/makeFetchOrganizationMembersUseCase";

export async function fetchOrganizationMembersAction(organizationId: string) {
  const session = await auth();

  if (!session) {
    throw new UnauthorizedError("notLoggedIn");
  }

  if (!organizationId) {
    throw new ValidationError("ID da organização é obrigatório.");
  }

  const useCase = makeFetchOrganizationMembersUseCase();

  const { members } = await useCase.execute({
    userId: session.user.id,
    organizationId,
  });

  // Serialização necessária para passar Dates do Server Component para o Client Component
  return { members };
}

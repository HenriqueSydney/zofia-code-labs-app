"use server";

import { auth } from "@/auth";
import { AppError } from "@/errors/AppError";
import { makeGetOrganizationCustomRoleByIdUseCase } from "@/useCases/organization/factories/makeGetOrganizationCustomRoleByIdUseCase";

export async function getCustomRolePermissionsAction(customRoleId: string) {
  const session = await auth();

  if (!session) {
    throw new AppError("Usuário não logado.");
  }

  if (!customRoleId) {
    throw new AppError("ID do Perfil de Acesso é obrigatório.");
  }

  const useCase = makeGetOrganizationCustomRoleByIdUseCase();

  const { customRole } = await useCase.execute({
    customRoleId: customRoleId,
    userId: session.user.id,
  });

  // Serialização necessária para passar Dates do Server Component para o Client Component
  return { customRole };
}

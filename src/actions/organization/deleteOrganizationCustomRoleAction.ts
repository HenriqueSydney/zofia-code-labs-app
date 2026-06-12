"use server";

import { auth } from "@/auth";
import { UnauthorizedError } from "@/errors";
import { makeDeleteOrganizationCustomRoleUseCase } from "@/useCases/organization/factories/makeDeleteOrganizationCustomRoleUseCase";
import { revalidatePath } from "next/cache"; // Importante para atualizar a lista

export async function deleteCustomRoleAction(roleId: string) {
  const session = await auth();

  if (!session) {
    throw new UnauthorizedError("notLoggedIn");
  }

  const useCase = makeDeleteOrganizationCustomRoleUseCase();

  await useCase.execute({
    roleId,
    userId: session.user.id,
  });

  // Atualiza a página para remover o item da tabela
  revalidatePath("/organization/[orgId]/roles", "page");
}

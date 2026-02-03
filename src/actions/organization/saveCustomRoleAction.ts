"use server";

import { auth } from "@/auth";
import { AppError } from "@/errors/AppError";
import { handleErrors } from "@/errors/handleErrors";
import { makeCreateOrganizationCustomRoleUseCase } from "@/useCases/organization/factories/makeCreateOrganizationCustomRoleUseCase";
import { makeUpdateOrganizationCustomRoleUseCase } from "@/useCases/organization/factories/makeUpdateOrganizationCustomRoleUseCase";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Schema de validação (deve bater com o do Front-end)
const saveRoleSchema = z.object({
  id: z.string().optional(), // Se vier, é edição
  orgId: z.cuid(),
  name: z.string().min(3),
  description: z.string().optional(),
  permissions: z.array(z.string()),
});

type SaveRoleInput = z.infer<typeof saveRoleSchema>;

export async function saveCustomRoleAction(input: SaveRoleInput) {
  const session = await auth();

  if (!session) {
    return { error: "Usuário não logado." };
  }

  // 1. Validação dos dados de entrada
  const result = saveRoleSchema.safeParse(input);

  if (!result.success) {
    return { error: result.error.flatten().fieldErrors };
  }

  const { id, orgId, name, description, permissions } = result.data;

  // 2. Roteamento para o Use Case correto
  try {
    if (id) {
      // --- FLUXO DE ATUALIZAÇÃO ---
      const updateUseCase = makeUpdateOrganizationCustomRoleUseCase();
      await updateUseCase.execute({
        userId: session.user.id,
        roleId: id,
        organizationId: orgId,
        name,
        description,
        permissions,
      });
    } else {
      // --- FLUXO DE CRIAÇÃO ---
      const createUseCase = makeCreateOrganizationCustomRoleUseCase();
      await createUseCase.execute({
        userId: session.user.id,
        organizationId: orgId,
        name,
        description,
        permissions,
      });
    }

    // 3. Revalidação do Cache
    // Atualiza a listagem de roles para mostrar o novo item imediatamente
    revalidatePath(`/organization/${orgId}/roles`);

    return { success: true };
  } catch (error) {
    const message = handleErrors(error);
    return { error: message };
  }
}

"use server";

import { auth } from "@/auth";
import {
  UpdateDefaultBacklogItemSchema,
  updateDefaultBacklogItemSchema,
} from "@/schemas/services/backlog/updateDefaultBacklogItemSchema";
import { makeUpdateServiceDefaultBacklogItemUseCase } from "@/useCases/services/backlogs/factories/makeUpdateServiceDefaultBacklogItemUseCase";
import { revalidatePath } from "next/cache";

export async function updateServiceDefaultBacklogAction(
  data: UpdateDefaultBacklogItemSchema,
  serviceTypeId: string,
) {
  // 1. Autenticação
  const session = await auth();
  if (!session?.user?.organizationId) {
    return {
      success: false,
      message: "Sessão expirada ou usuário sem organização vinculada.",
    };
  }

  // 2. Validação Zod
  const parsed = updateDefaultBacklogItemSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      message:
        parsed.error.issues[0].message || "Dados inválidos para atualização.",
    };
  }

  const { id, title, description, priority, points } = parsed.data;

  try {
    // 3. Instanciação
    const updateBacklogUseCase = makeUpdateServiceDefaultBacklogItemUseCase();

    // 4. Execução
    // O UseCase deve verificar se o backlog pertence à organizationId antes de atualizar
    await updateBacklogUseCase.execute({
      userId: session?.user.id,
      data: {
        id,
        title,
        description,
        priority,
        points,
      },
    });

    revalidatePath(`/settings/services/catalog`);
    revalidatePath(`/settings/services/catalog/${serviceTypeId}/`);

    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        message: error.message,
      };
    }

    return {
      success: false,
      message: "Erro interno ao atualizar backlog.",
    };
  }
}

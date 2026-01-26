"use server";

import { auth } from "@/auth";
import {
  DefaultBacklogItemSchema,
  defaultbacklogItemSchema,
} from "@/schemas/services/backlog/defaultBacklogItemSchema";
import { makeCreateServiceDefaultBacklogItemUseCase } from "@/useCases/services/backlogs/factories/makeCreateServiceDefaultBacklogItemUseCase";
import { revalidatePath } from "next/cache";

export async function createServiceDefaultBacklogItemAction(
  data: DefaultBacklogItemSchema,
) {
  // 1. Autenticação
  const session = await auth();
  if (!session?.user?.organizationId) {
    return {
      success: false,
      message: "Sessão expirada ou usuário sem organização vinculada.",
    };
  }

  // 2. Validação Zod (Input)
  const parsed = defaultbacklogItemSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0].message || "Dados inválidos.",
    };
  }

  // Extrair dados validados
  const { serviceTypeId, title, description, priority, points } = parsed.data;

  try {
    // 3. Instanciação das dependências
    const createBacklogUseCase = makeCreateServiceDefaultBacklogItemUseCase();

    // 4. Execução
    await createBacklogUseCase.execute({
      organizationId: session.user.organizationId,
      userId: session.user.id,
      data: {
        serviceTypeId,
        title,
        description,
        priority,
        points,
      },
    });

    revalidatePath(`/settings/services/catalog`);
    revalidatePath(`/settings/services/catalog/${serviceTypeId}`);
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
      message: "Erro interno ao criar backlog.",
    };
  }
}

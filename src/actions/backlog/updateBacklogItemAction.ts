"use server";

import { auth } from "@/auth";
import { updateBacklogItemSchema } from "@/schemas/backlog/updateBacklogItemSchema";
import { makeUpdateBacklogItemUseCase } from "@/useCases/backlog/factories/makeUpdateBacklogItemUseCase";
import { revalidatePath } from "next/cache";

export async function updateBacklogAction(data: unknown, projectSlug: string) {
  // 1. Autenticação
  const session = await auth();
  if (!session?.user?.organizationId) {
    return {
      success: false,
      message: "Sessão expirada ou usuário sem organização vinculada.",
    };
  }

  // 2. Validação Zod
  const parsed = updateBacklogItemSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      message:
        parsed.error.issues[0].message || "Dados inválidos para atualização.",
    };
  }

  const {
    id,
    title,
    description,
    priority,
    status,
    assigneeId,
    points,
    externalLink,
  } = parsed.data;

  try {
    // 3. Instanciação
    const updateBacklogUseCase = makeUpdateBacklogItemUseCase();

    // 4. Execução
    // O UseCase deve verificar se o backlog pertence à organizationId antes de atualizar
    await updateBacklogUseCase.execute({
      userId: session?.user.id,
      data: {
        id,
        title,
        description,
        priority,
        status,
        assigneeId,
        points,
        externalLink,
        organizationId: session.user.organizationId,
      },
    });

    // 5. Revalidação
    revalidatePath(`/projects/${projectSlug}/backlog/`);

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

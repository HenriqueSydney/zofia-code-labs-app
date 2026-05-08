"use server";

import { auth } from "@/auth";
import { changeBacklogItemStatusSchema } from "@/schemas/backlog/changeBacklogItemStatusSchema"; // Ex: { id, newStatus }
import { makeUpdateBacklogItemStatusUseCase } from "@/useCases/backlog/factories/makeUpdateBacklogItemStatusUseCase";
import { revalidatePath } from "next/cache";

export async function changeBacklogStatusAction(data: unknown) {
  // 1. Autenticação
  const session = await auth();
  if (!session?.user?.organizationId) {
    return {
      success: false,
      message: "Sessão expirada.",
    };
  }

  // 2. Validação Zod
  const parsed = changeBacklogItemStatusSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0].message || "Status inválido.",
    };
  }

  const { id, status } = parsed.data;

  try {
    // 3. Instanciação
    const changeStatusUseCase = makeUpdateBacklogItemStatusUseCase();

    // 4. Execução
    const { projectId, slug, clientSlug } = await changeStatusUseCase.execute({
      id,
      userId: session.user.id,
      newStatus: status,
    });

    revalidatePath(`/clients/${clientSlug}/projects/${slug}/backlogs`);

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
      message: "Erro interno ao alterar status.",
    };
  }
}

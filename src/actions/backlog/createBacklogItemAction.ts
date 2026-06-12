"use server";

import { resolveActionErrorMessage, resolveSuccessMessage, serverErrorMessage } from "@/errors/resolveActionErrorMessage";
import { auth } from "@/auth";
import { backlogItemSchema } from "@/schemas/backlog/backlogItemSchema";
import { makeCreateBacklogItemUseCase } from "@/useCases/backlog/factories/makeCreateBacklogItemUseCase";
import { revalidatePath } from "next/cache";

export async function createBacklogAction(data: unknown, projectSlug: string) {
  // 1. Autenticação
  const session = await auth();
  if (!session?.user?.organizationId) {
    return {
      success: false,
      message: await serverErrorMessage("sessionExpiredNoOrg"),
    };
  }

  // 2. Validação Zod (Input)
  const parsed = backlogItemSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0].message || await serverErrorMessage("invalidData"),
    };
  }

  // Extrair dados validados
  const {
    projectId,
    title,
    description,
    priority,
    status,
    assigneeId,
    points,
    externalLink,
  } = parsed.data;

  try {
    // 3. Instanciação das dependências
    const createBacklogUseCase = makeCreateBacklogItemUseCase();

    // 4. Execução
    await createBacklogUseCase.execute({
      userId: session.user.id,
      data: {
        projectId,
        title,
        description,
        priority,
        status,
        assigneeId,
        points,
        externalLink,
      },
    });

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
      message: await serverErrorMessage("backlogCreateFailed"),
    };
  }
}

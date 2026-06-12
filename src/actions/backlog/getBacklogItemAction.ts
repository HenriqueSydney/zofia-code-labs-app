"use server";

import { resolveActionErrorMessage, resolveSuccessMessage, serverErrorMessage } from "@/errors/resolveActionErrorMessage";
import { auth } from "@/auth";
import { ValidationError } from "@/errors";
import { getBacklogItemSchema } from "@/schemas/backlog/getBacklogItemSchema"; // Ex: { id: string }
import { makeGetBacklogItemUseCase } from "@/useCases/backlog/factories/makeGetBacklogItemUseCase";

export async function getBacklogAction(data: unknown) {
  // 1. Autenticação
  const session = await auth();
  if (!session?.user?.organizationId) {
    throw new ValidationError("unauthenticated");
  }

  // 2. Validação Zod
  const parsed = getBacklogItemSchema.safeParse(data);

  if (!parsed.success) {
    throw new ValidationError("invalidBacklogIdentifier");
  }

  const { id } = parsed.data;

  try {
    // 3. Instanciação
    const getBacklogUseCase = makeGetBacklogItemUseCase();

    // 4. Execução
    const backlog = await getBacklogUseCase.execute({
      id,
      userId: session.user.id,
    });

    return {
      success: true,
      data: backlog,
    };
  } catch (error) {
    const message = await resolveActionErrorMessage(error);
    throw new ValidationError(message);
  }
}

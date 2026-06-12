"use server";

import { resolveActionErrorMessage, resolveSuccessMessage, serverErrorMessage } from "@/errors/resolveActionErrorMessage";
import { auth } from "@/auth";
import { ValidationError } from "@/errors";
import {
  ListBacklogItemsInput,
  listBacklogItemsSchema,
} from "@/schemas/backlog/listBacklogItemsSchema";
import { makeListBacklogItemsUseCase } from "@/useCases/backlog/factories/makeListBacklogItemsUseCase";

export async function listBacklogsItemsAction(data: ListBacklogItemsInput) {
  const session = await auth();
  if (!session?.user?.organizationId) {
    throw new ValidationError("unauthenticated");
  }

  // 2. Validação Zod
  const parsed = listBacklogItemsSchema.safeParse(data);

  if (!parsed.success) {
    throw new ValidationError("invalidSearchParams");
  }

  // projectId é crucial aqui para filtrar no contexto da organização
  const { projectId, page, numberPerPage, status, priority } = parsed.data;

  try {
    // 3. Instanciação
    const fetchBacklogsUseCase = makeListBacklogItemsUseCase();

    // 4. Execução
    const result = await fetchBacklogsUseCase.execute({
      userId: session.user.id,
      projectId,
      page: page || 1,
      numberPerPage: numberPerPage || 20,
      status,
      priority,
    });

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    const message = await resolveActionErrorMessage(error);
    throw new ValidationError(message);
  }
}

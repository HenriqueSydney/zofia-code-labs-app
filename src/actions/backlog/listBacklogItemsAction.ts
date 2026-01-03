"use server";

import { auth } from "@/auth";
import { AppError } from "@/errors/AppError";
import { handleErrors } from "@/errors/handleErrors";
import {
  ListBacklogItemsInput,
  listBacklogItemsSchema,
} from "@/schemas/backlog/listBacklogItemsSchema";
import { makeListBacklogItemsUseCase } from "@/useCases/backlog/factories/makeListBacklogItemsUseCase";

export async function listBacklogsItemsAction(data: ListBacklogItemsInput) {
  const session = await auth();
  if (!session?.user?.organizationId) {
    throw new AppError("Usuário não atenticado");
  }

  // 2. Validação Zod
  const parsed = listBacklogItemsSchema.safeParse(data);

  if (!parsed.success) {
    throw new AppError("Parâmetros de busca inválidos");
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
    const message = handleErrors(error);
    throw new AppError(message);
  }
}

"use server";

import { auth } from "@/auth";
import { AppError } from "@/errors/AppError";
import { handleErrors } from "@/errors/handleErrors";
import { BacklogPriority } from "@/generated/prisma/enums";
import { makeListServiceDefaultBacklogsItemsUseCase } from "@/useCases/services/backlogs/factories/makeListServiceDefaultBacklogsItemsUseCase";

export async function listServiceDefaultBacklogsItemsAction(params: {
  serviceId: string;
  query?: string;
  priority?: BacklogPriority;
}) {
  const session = await auth();

  if (!session?.user?.organizationId) {
    throw new AppError("Usuário não autenticado");
  }

  const useCase = makeListServiceDefaultBacklogsItemsUseCase();

  try {
    const defaultBacklogItems = await useCase.execute({
      serviceId: params.serviceId,
      organizationId: session.user.organizationId,
      priority: params.priority,
      query: params.query,
    });

    return defaultBacklogItems;
  } catch (error) {
    const message = handleErrors(error);
    throw new AppError(message);
  }
}

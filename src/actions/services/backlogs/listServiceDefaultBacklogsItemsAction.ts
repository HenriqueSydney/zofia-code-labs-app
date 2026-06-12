"use server";

import { resolveActionErrorMessage, resolveSuccessMessage, serverErrorMessage } from "@/errors/resolveActionErrorMessage";
import { auth } from "@/auth";
import { UnauthorizedError, ValidationError } from "@/errors";
import { BacklogPriority } from "@/generated/prisma/enums";
import { makeListServiceDefaultBacklogsItemsUseCase } from "@/useCases/services/backlogs/factories/makeListServiceDefaultBacklogsItemsUseCase";

export async function listServiceDefaultBacklogsItemsAction(params: {
  serviceId: string;
  query?: string;
  priority?: BacklogPriority;
}) {
  const session = await auth();

  if (!session?.user?.organizationId) {
    throw new UnauthorizedError(await serverErrorMessage("unauthenticated"));
  }

  const useCase = makeListServiceDefaultBacklogsItemsUseCase();

  try {
    const defaultBacklogItems = await useCase.execute({
      serviceId: params.serviceId,
      organizationId: session.user.organizationId,
      userId: session.user.id,
      priority: params.priority,
      query: params.query,
    });

    return defaultBacklogItems;
  } catch (error) {
    const message = await resolveActionErrorMessage(error);
    throw new ValidationError(message);
  }
}

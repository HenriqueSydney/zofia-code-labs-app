"use server";

import { resolveActionErrorMessage, resolveSuccessMessage, serverErrorMessage } from "@/errors/resolveActionErrorMessage";
import { Pagination } from "@/@types/Pagination";
import { auth } from "@/auth";
import { ValidationError } from "@/errors";
import { makeUserRepository } from "@/repositories/factories/makeUserRepository";
import { makeListBacklogItemsUseCase } from "@/useCases/backlog/factories/makeListBacklogItemsUseCase";

export async function listUsersByOrganizationAction(
  organizationId: string,
  pagination?: Pagination
) {
  const session = await auth();
  if (!session?.user?.organizationId) {
    throw new ValidationError("unauthenticated");
  }

  try {
    const usersRepository = makeUserRepository();
    const result = await usersRepository.fetchUsersByOrganizationId(
      organizationId,
      pagination
    );

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    const message = await resolveActionErrorMessage(error);
    throw new ValidationError(message);
  }
}

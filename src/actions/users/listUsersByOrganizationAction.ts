"use server";

import { Pagination } from "@/@types/Pagination";
import { auth } from "@/auth";
import { AppError } from "@/errors/AppError";
import { handleErrors } from "@/errors/handleErrors";
import { makeUserRepository } from "@/repositories/factories/makeUserRepository";
import { makeListBacklogItemsUseCase } from "@/useCases/backlog/factories/makeListBacklogItemsUseCase";

export async function listUsersByOrganizationAction(
  organizationId: string,
  pagination?: Pagination
) {
  const session = await auth();
  if (!session?.user?.organizationId) {
    throw new AppError("Usuário não atenticado");
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
    const message = handleErrors(error);
    throw new AppError(message);
  }
}

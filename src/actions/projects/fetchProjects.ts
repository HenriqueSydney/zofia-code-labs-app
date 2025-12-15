"use server";

import { auth } from "@/auth";
import { AppError } from "@/errors/AppError";

import { makeFetchProjectUseCase } from "@/useCases/projects/factories/makeFetchProjectUseCase";

export async function fetchProjects(
  query?: string,
  pagination?: { page?: number; numberPerPage?: number }
) {
  const session = await auth();
  if (!session?.user) throw new AppError("Usuário não autenticado");

  const useCase = makeFetchProjectUseCase();

  return await useCase.execute({
    query,
    userId: session.user.id,
    organizationId: session.user.organizationId,
    page: pagination?.page,
    numberPerPage: pagination?.numberPerPage,
  });
}

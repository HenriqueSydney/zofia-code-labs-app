"use server";

import { auth } from "@/auth";
import { AppError } from "@/errors/AppError";
import { makeListAllContractsUseCase } from "@/useCases/contract/factories/makeListAllContractsUseCase";

interface FetchProjectsFilter {
  query?: string;
}

export async function fetchAllContracts(
  filter?: FetchProjectsFilter,
  pagination?: { page?: number; numberPerPage?: number }
) {
  const session = await auth();
  if (!session?.user) throw new AppError("Usuário não autenticado");

  const useCase = makeListAllContractsUseCase();

  return await useCase.execute({
    filter,
    userId: session.user.id,
    organizationId: session.user.organizationId,
    page: pagination?.page,
    numberPerPage: pagination?.numberPerPage,
  });
}

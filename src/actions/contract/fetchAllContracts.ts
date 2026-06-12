"use server";

import { resolveActionErrorMessage, resolveSuccessMessage, serverErrorMessage } from "@/errors/resolveActionErrorMessage";
import { auth } from "@/auth";
import { UnauthorizedError } from "@/errors";
import { makeListAllContractsUseCase } from "@/useCases/contract/factories/makeListAllContractsUseCase";

interface FetchProjectsFilter {
  query?: string;
}

export async function fetchAllContracts(
  filter?: FetchProjectsFilter,
  pagination?: { page?: number; numberPerPage?: number }
) {
  const session = await auth();
  if (!session?.user) throw new UnauthorizedError(await serverErrorMessage("unauthenticated"));

  const useCase = makeListAllContractsUseCase();

  return await useCase.execute({
    filter,
    userId: session.user.id,
    organizationId: session.user.organizationId,
    page: pagination?.page,
    numberPerPage: pagination?.numberPerPage,
  });
}

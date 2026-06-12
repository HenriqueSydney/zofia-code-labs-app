"use server";

import { resolveActionErrorMessage, resolveSuccessMessage, serverErrorMessage } from "@/errors/resolveActionErrorMessage";
import { auth } from "@/auth";
import { UnauthorizedError } from "@/errors";

import { makeFetchProjectUseCase } from "@/useCases/projects/factories/makeFetchProjectUseCase";

interface FetchProjectsFilter {
  query?: string;
  clientId?: string;
  clientSlug?: string;
}

export async function fetchProjects(
  filter?: FetchProjectsFilter,
  pagination?: { page?: number; numberPerPage?: number },
) {
  const session = await auth();
  if (!session?.user) throw new UnauthorizedError(await serverErrorMessage("unauthenticated"));

  const useCase = makeFetchProjectUseCase();
 
  return await useCase.execute({
    filter,
    userId: session.user.id,
    organizationId: session.user.organizationId,
    page: pagination?.page,
    numberPerPage: pagination?.numberPerPage,
  });
}

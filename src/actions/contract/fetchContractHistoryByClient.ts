"use server";

import { resolveActionErrorMessage, resolveSuccessMessage, serverErrorMessage } from "@/errors/resolveActionErrorMessage";
import { auth } from "@/auth";
import { UnauthorizedError } from "@/errors";
import { makeListContractsByClientSlugUseCase } from "@/useCases/contract/factories/makeListContractsByClientIdUseCase";

export async function fetchContractHistoryByClient(
  clientSlug: string,
  pagination?: { page?: number; numberPerPage?: number }
) {
  const session = await auth();
  if (!session?.user) throw new UnauthorizedError(await serverErrorMessage("unauthenticated"));

  const contractUseCase = makeListContractsByClientSlugUseCase();

  const contractHistory = await contractUseCase.execute({
    clientSlug,
    userId: session.user.id,
    organizationId: session.user.organizationId,
    ...pagination,
  });

  return contractHistory;
}

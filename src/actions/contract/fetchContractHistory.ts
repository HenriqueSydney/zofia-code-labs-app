"use server";

import { resolveActionErrorMessage, resolveSuccessMessage, serverErrorMessage } from "@/errors/resolveActionErrorMessage";
import { auth } from "@/auth";
import { UnauthorizedError } from "@/errors";
import { makeListContractsByProjectIdUseCase } from "@/useCases/contract/factories/makeListContractsByProjectIdUseCase";

export async function fetchContractHistory(
  projectId: string,
  pagination?: { page?: number; numberPerPage?: number }
) {
  const session = await auth();
  if (!session?.user) throw new UnauthorizedError(await serverErrorMessage("unauthenticated"));
  const contractUseCase = makeListContractsByProjectIdUseCase();

  const contractHistory = await contractUseCase.execute({
    projectId,
    userId: session.user.id,
    organizationId: session.user.organizationId,
    ...pagination,
  });

  return contractHistory;
}

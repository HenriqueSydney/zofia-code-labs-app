"use server";

import { auth } from "@/auth";
import { AppError } from "@/errors/AppError";
import { makeListContractsByClientSlugUseCase } from "@/useCases/contract/factories/makeListContractsByClientIdUseCase";

export async function fetchContractHistoryByClient(
  clientSlug: string,
  pagination?: { page?: number; numberPerPage?: number }
) {
  const session = await auth();
  if (!session?.user) throw new AppError("Usuário não autenticado");

  const contractUseCase = makeListContractsByClientSlugUseCase();

  const contractHistory = await contractUseCase.execute({
    clientSlug,
    userId: session.user.id,
    organizationId: session.user.organizationId,
    ...pagination,
  });

  return contractHistory;
}

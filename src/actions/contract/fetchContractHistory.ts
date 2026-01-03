"use server";

import { auth } from "@/auth";
import { AppError } from "@/errors/AppError";
import { makeListContractsByProjectIdUseCase } from "@/useCases/contract/factories/makeListContractsByProjectIdUseCase";

export async function fetchContractHistory(
  projectId: string,
  pagination?: { page?: number; numberPerPage?: number }
) {
  const session = await auth();
  if (!session?.user) throw new AppError("Usuário não autenticado");
  const contractUseCase = makeListContractsByProjectIdUseCase();

  const contractHistory = await contractUseCase.execute({
    projectId,
    userId: session.user.id,
    organizationId: session.user.organizationId,
    ...pagination,
  });

  return contractHistory;
}

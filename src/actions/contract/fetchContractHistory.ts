"use server";

import { auth } from "@/auth";
import { ContractWithDetails } from "@/repositories/IContractRepository";
import { makeListContractsByProjectIdUseCase } from "@/useCases/contract/factories/makeListContractsByProjectIdUseCase";

export async function fetchContractHistory(
  projectId: string
): Promise<ContractWithDetails[]> {
  const session = await auth();
  if (!session?.user) return [];
  const contractUseCase = makeListContractsByProjectIdUseCase();

  try {
    const contractHistory = await contractUseCase.execute({
      projectId,
      userId: session.user.id,
      organizationId: session.user.organizationId,
    });
    
    return contractHistory;
  } catch (error) {
    return [];
  }
}

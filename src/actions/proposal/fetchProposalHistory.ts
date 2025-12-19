"use server";

import { auth } from "@/auth";
import { ProposalWithDetails } from "@/repositories/IProposalRepository";
import { makeListProposalsByProjectIdUseCase } from "@/useCases/proposal/factories/makeListProposalsByProjectIdUseCase";

export async function fetchProposalHistory(
  projectId: string
): Promise<ProposalWithDetails[]> {
  const session = await auth();
  if (!session?.user) return [];
  const proposalUseCase = makeListProposalsByProjectIdUseCase();

  try {
    const proposalHistory = await proposalUseCase.execute({
      projectId,
      userId: session.user.id,
      organizationId: session.user.organizationId,
    });
    
    return proposalHistory;
  } catch (error) {
    return [];
  }
}

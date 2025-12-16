import { IProposalRepository } from "../IProposalRepository";
import { PrismaProposalRepository } from "../prisma/PrismaProposalRepository";

let proposalRepo: IProposalRepository | null = null;

export function makeProposalRepository() {
  if (!proposalRepo) {
    proposalRepo = new PrismaProposalRepository();
  }
  return proposalRepo;
}

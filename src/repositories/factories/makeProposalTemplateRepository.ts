import { IProposalTemplateRepository } from "../IProposalTemplateRepository";
import { PrismaProposalTemplateRepository } from "../prisma/PrismaProposalTemplateRepository";

let proposalTemplateRepo: IProposalTemplateRepository | null = null;

export function makeProposalTemplateRepository() {
  if (!proposalTemplateRepo) {
    proposalTemplateRepo = new PrismaProposalTemplateRepository();
  }
  return proposalTemplateRepo;
}

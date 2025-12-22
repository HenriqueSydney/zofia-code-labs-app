import { IContractTemplateRepository } from "../IContractTemplateRepository";
import { PrismaContractTemplateRepository } from "../prisma/PrismaContractTemplateRepository";

let contractTemplateRepo: IContractTemplateRepository | null = null;

export function makeContractTemplateRepository() {
  if (!contractTemplateRepo) {
    contractTemplateRepo = new PrismaContractTemplateRepository();
  }
  return contractTemplateRepo;
}

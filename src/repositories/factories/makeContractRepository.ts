import { IContractRepository } from "../IContractRepository";
import { PrismaContractRepository } from "../prisma/PrismaContractRepository";

let contractRepo: IContractRepository | null = null;

export function makeContractRepository() {
  if (!contractRepo) {
    contractRepo = new PrismaContractRepository();
  }
  return contractRepo;
}

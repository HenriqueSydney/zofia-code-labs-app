import { CreateContractUseCase } from "../CreateContractUseCase";
import { makeAuditLogRepository } from "@/repositories/factories/makeAuditLogRepository";
import { makeContractRepository } from "@/repositories/factories/makeContractRepository";
import { makeProposalRepository } from "@/repositories/factories/makeProposalRepository";
import { makeS3StorageService } from "@/services/s3Client/makeS3StorageService";

let createContractUseCase: CreateContractUseCase;

export function makeCreateContractUseCase() {
  if (!createContractUseCase) {
    const contractRepository = makeContractRepository();
    const proposalRepository = makeProposalRepository();
    const storageService = makeS3StorageService();
    const auditLogRepository = makeAuditLogRepository();
    createContractUseCase = new CreateContractUseCase(
      contractRepository,
      proposalRepository,
      storageService,
      auditLogRepository,
    );
  }

  return createContractUseCase;
}

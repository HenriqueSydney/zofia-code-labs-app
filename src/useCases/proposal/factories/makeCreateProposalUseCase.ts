import { CreateProposalUseCase } from "../CreateProposalUseCase";
import { makeAuditLogRepository } from "@/repositories/factories/makeAuditLogRepository";
import { makeProposalRepository } from "@/repositories/factories/makeProposalRepository";
import { makeServiceTypeRepository } from "@/repositories/factories/makeServiceTypeRepository";
import { makeS3StorageService } from "@/services/s3Client/makeS3StorageService";

let createProposalUseCaseUseCase: CreateProposalUseCase;

export function makeCreateProposalUseCase() {
  if (!createProposalUseCaseUseCase) {
    const proposalRepository = makeProposalRepository();
    const serviceTypeRepository = makeServiceTypeRepository();
    const storageService = makeS3StorageService();
    const auditLogRepository = makeAuditLogRepository();
    createProposalUseCaseUseCase = new CreateProposalUseCase(
      proposalRepository,
      serviceTypeRepository,
      storageService,
      auditLogRepository,
    );
  }

  return createProposalUseCaseUseCase;
}

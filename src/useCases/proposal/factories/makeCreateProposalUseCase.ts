import { CreateProposalUseCase } from "../CreateProposalUseCase";
import { makeAuditLogRepository } from "@/repositories/factories/makeAuditLogRepository";
import { makeDocumentTemplateRepository } from "@/repositories/factories/makeDocumentTemplateRepository";
import { makeProposalRepository } from "@/repositories/factories/makeProposalRepository";
import { makeProposalTemplateRepository } from "@/repositories/factories/makeProposalTemplateRepository";
import { makeServiceTypeRepository } from "@/repositories/factories/makeServiceTypeRepository";
import { makeS3StorageService } from "@/services/s3Client/makeS3StorageService";

let createProposalUseCaseUseCase: CreateProposalUseCase;

export function makeCreateProposalUseCase() {
  if (!createProposalUseCaseUseCase) {
    const proposalRepository = makeProposalRepository();
    const proposalTemplateRepository = makeProposalTemplateRepository();
    const documentTemplateRepository = makeDocumentTemplateRepository();
    const serviceTypeRepository = makeServiceTypeRepository();
    const storageService = makeS3StorageService();
    const auditLogRepository = makeAuditLogRepository();
    createProposalUseCaseUseCase = new CreateProposalUseCase(
      proposalRepository,
      proposalTemplateRepository,
      documentTemplateRepository,
      serviceTypeRepository,
      storageService,
      auditLogRepository
    );
  }

  return createProposalUseCaseUseCase;
}

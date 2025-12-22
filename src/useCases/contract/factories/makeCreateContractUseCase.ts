import { CreateContractUseCase } from "../CreateContractUseCase";
import { makeAuditLogRepository } from "@/repositories/factories/makeAuditLogRepository";
import { makeDocumentTemplateRepository } from "@/repositories/factories/makeDocumentTemplateRepository";
import { makeContractRepository } from "@/repositories/factories/makeContractRepository";
import { makeContractTemplateRepository } from "@/repositories/factories/makeContractTemplateRepository";
import { makeS3StorageService } from "@/services/s3Client/makeS3StorageService";
import { makeProposalRepository } from "@/repositories/factories/makeProposalRepository";

let createContractUseCaseUseCase: CreateContractUseCase;

export function makeCreateContractUseCase() {
  if (!createContractUseCaseUseCase) {
    const contractRepository = makeContractRepository();
    const contractTemplateRepository = makeContractTemplateRepository();
    const documentTemplateRepository = makeDocumentTemplateRepository();
    const proposalRepository = makeProposalRepository();
    const storageService = makeS3StorageService();
    const auditLogRepository = makeAuditLogRepository();
    createContractUseCaseUseCase = new CreateContractUseCase(
      contractRepository,
      contractTemplateRepository,
      documentTemplateRepository,
      proposalRepository,
      storageService,
      auditLogRepository
    );
  }

  return createContractUseCaseUseCase;
}

import { ChangeProposalStatusUseCase } from "../ChangeProposalStatusUseCase";
import { makeAuditLogRepository } from "@/repositories/factories/makeAuditLogRepository";
import { makeProposalRepository } from "@/repositories/factories/makeProposalRepository";
import { makeS3StorageService } from "@/services/s3Client/makeS3StorageService";
import { makeChangeProjectStatusUseCase } from "@/useCases/projects/factories/makeChangeProjectStatusUseCase";

let changeProposalStatusUseCase: ChangeProposalStatusUseCase;

export function makeChangeProposalStatus() {
  if (!changeProposalStatusUseCase) {
    const proposalRepository = makeProposalRepository();
    const changeProjectStatusUseCase = makeChangeProjectStatusUseCase();
    const auditLogRepository = makeAuditLogRepository();
    const storageService = makeS3StorageService();
    changeProposalStatusUseCase = new ChangeProposalStatusUseCase(
      proposalRepository,
      changeProjectStatusUseCase,
      auditLogRepository,
      storageService,
    );
  }

  return changeProposalStatusUseCase;
}

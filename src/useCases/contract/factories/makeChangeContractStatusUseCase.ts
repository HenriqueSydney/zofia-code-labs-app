import { ChangeContractStatusUseCase } from "../ChangeContractStatusUseCase";
import { makeAuditLogRepository } from "@/repositories/factories/makeAuditLogRepository";
import { makeContractRepository } from "@/repositories/factories/makeContractRepository";
import { makeDocumentSignService } from "@/services/documenso/makeDocumentSignService";
import { makeS3StorageService } from "@/services/s3Client/makeS3StorageService";
import { makeChangeProjectStatusUseCase } from "@/useCases/projects/factories/makeChangeProjectStatusUseCase";

let changeContractStatusUseCase: ChangeContractStatusUseCase;

export function makeChangeContractStatus() {
  if (!changeContractStatusUseCase) {
    const contractRepository = makeContractRepository();
    const changeProjectStatusUseCase = makeChangeProjectStatusUseCase();
    const auditLogRepository = makeAuditLogRepository();
    const storageService = makeS3StorageService();
    const documentSignService = makeDocumentSignService();
    changeContractStatusUseCase = new ChangeContractStatusUseCase(
      contractRepository,
      changeProjectStatusUseCase,
      auditLogRepository,
      storageService,
      documentSignService
    );
  }

  return changeContractStatusUseCase;
}

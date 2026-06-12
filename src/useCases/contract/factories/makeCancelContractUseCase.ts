import { CancelContractUseCase } from "../CancelContractUseCase";
import { makeAuditLogRepository } from "@/repositories/factories/makeAuditLogRepository";
import { makeContractRepository } from "@/repositories/factories/makeContractRepository";
import { makeDocumentSignService } from "@/services/documenso/makeDocumentSignService";
import { makeChangeProjectStatusUseCase } from "@/useCases/projects/factories/makeChangeProjectStatusUseCase";

let cancelContractUseCase: CancelContractUseCase;

export function makeCancelContractUseCase() {
  if (!cancelContractUseCase) {
    const contractRepository = makeContractRepository();
    const auditLogRepository = makeAuditLogRepository();
    const changeProjectStatusUseCase = makeChangeProjectStatusUseCase();
    const documentSignService = makeDocumentSignService();
    cancelContractUseCase = new CancelContractUseCase(
      contractRepository,
      auditLogRepository,
      changeProjectStatusUseCase,
      documentSignService,
    );
  }

  return cancelContractUseCase;
}

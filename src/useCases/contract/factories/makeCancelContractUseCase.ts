import { CancelContractUseCase } from "../CancelContractUseCase";
import { makeAuditLogRepository } from "@/repositories/factories/makeAuditLogRepository";
import { makeContractRepository } from "@/repositories/factories/makeContractRepository";

let cancelContractUseCase: CancelContractUseCase;

export function makeCancelContractUseCase() {
  if (!cancelContractUseCase) {
    const contractRepository = makeContractRepository();
    const auditLogRepository = makeAuditLogRepository();
    cancelContractUseCase = new CancelContractUseCase(
      contractRepository,
      auditLogRepository
    );
  }

  return cancelContractUseCase;
}

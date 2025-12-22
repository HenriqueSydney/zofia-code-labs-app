import { UpdateContractUseCase } from "../UpdateContractUseCase";
import { makeAuditLogRepository } from "@/repositories/factories/makeAuditLogRepository";
import { makeContractRepository } from "@/repositories/factories/makeContractRepository";

let updateContractUseCase: UpdateContractUseCase;

export function makeUpdateContractUseCase() {
  if (!updateContractUseCase) {
    const contractRepository = makeContractRepository();
    const auditLogRepository = makeAuditLogRepository();
    updateContractUseCase = new UpdateContractUseCase(
      contractRepository,
      auditLogRepository
    );
  }

  return updateContractUseCase;
}

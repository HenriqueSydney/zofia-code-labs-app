import { ChangeContractStatusUseCase } from "../ChangeContractStatusUseCase";
import { makeAuditLogRepository } from "@/repositories/factories/makeAuditLogRepository";
import { makeContractRepository } from "@/repositories/factories/makeContractRepository";
import { makeChangeProjectStatusUseCase } from "@/useCases/projects/factories/makeChangeProjectStatusUseCase";

let changeContractStatusUseCase: ChangeContractStatusUseCase;

export function makeChangeContractStatus() {
  if (!changeContractStatusUseCase) {
    const contractRepository = makeContractRepository();
    const changeProjectStatusUseCase = makeChangeProjectStatusUseCase();
    const auditLogRepository = makeAuditLogRepository();
    changeContractStatusUseCase = new ChangeContractStatusUseCase(
      contractRepository,
      changeProjectStatusUseCase,
      auditLogRepository
    );
  }

  return changeContractStatusUseCase;
}

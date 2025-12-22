import { ChangeProposalStatusUseCase } from "../ChangeProposalStatusUseCase";
import { makeAuditLogRepository } from "@/repositories/factories/makeAuditLogRepository";
import { makeProposalRepository } from "@/repositories/factories/makeProposalRepository";
import { makeChangeProjectStatusUseCase } from "@/useCases/projects/factories/makeChangeProjectStatusUseCase";

let changeProposalStatusUseCase: ChangeProposalStatusUseCase;

export function makeChangeProposalStatus() {
  if (!changeProposalStatusUseCase) {
    const proposalRepository = makeProposalRepository();
    const changeProjectStatusUseCase = makeChangeProjectStatusUseCase();
    const auditLogRepository = makeAuditLogRepository();
    changeProposalStatusUseCase = new ChangeProposalStatusUseCase(
      proposalRepository,
      changeProjectStatusUseCase,
      auditLogRepository
    );
  }

  return changeProposalStatusUseCase;
}

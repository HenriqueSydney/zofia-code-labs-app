import { ChangeProposalStatusUseCase } from "../ChangeProposalStatusUseCase";
import { makeAuditLogRepository } from "@/repositories/factories/makeAuditLogRepository";
import { makeProposalRepository } from "@/repositories/factories/makeProposalRepository";

let changeProposalStatusUseCase: ChangeProposalStatusUseCase;

export function makeChangeProposalStatus() {
  if (!changeProposalStatusUseCase) {
    const proposalRepository = makeProposalRepository();
    const auditLogRepository = makeAuditLogRepository();
    changeProposalStatusUseCase = new ChangeProposalStatusUseCase(
      proposalRepository,
      auditLogRepository
    );
  }

  return changeProposalStatusUseCase;
}

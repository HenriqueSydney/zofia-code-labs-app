import { CancelProposalUseCase } from "../CancelProposalUseCase";
import { makeAuditLogRepository } from "@/repositories/factories/makeAuditLogRepository";
import { makeProposalRepository } from "@/repositories/factories/makeProposalRepository";

let cancelProposalUseCase: CancelProposalUseCase;

export function makeCancelProposalUseCase() {
  if (!cancelProposalUseCase) {
    const proposalRepository = makeProposalRepository();
    const auditLogRepository = makeAuditLogRepository();
    cancelProposalUseCase = new CancelProposalUseCase(
      proposalRepository,
      auditLogRepository
    );
  }

  return cancelProposalUseCase;
}

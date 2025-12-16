import { DeleteProposalUseCase } from "../DeleteProposalUseCase";
import { makeAuditLogRepository } from "@/repositories/factories/makeAuditLogRepository";
import { makeProposalRepository } from "@/repositories/factories/makeProposalRepository";

let deleteProposalUseCase: DeleteProposalUseCase;

export function makeDeleteProposalUseCase() {
  if (!deleteProposalUseCase) {
    const proposalRepository = makeProposalRepository();
    const auditLogRepository = makeAuditLogRepository();
    deleteProposalUseCase = new DeleteProposalUseCase(
      proposalRepository,
      auditLogRepository
    );
  }

  return deleteProposalUseCase;
}

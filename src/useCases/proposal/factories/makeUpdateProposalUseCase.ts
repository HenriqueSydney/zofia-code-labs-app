import { UpdateProposalUseCase } from "../UpdateProposalUseCase";
import { makeAuditLogRepository } from "@/repositories/factories/makeAuditLogRepository";
import { makeProposalRepository } from "@/repositories/factories/makeProposalRepository";

let updateProposalUseCase: UpdateProposalUseCase;

export function makeUpdateProposalUseCase() {
  if (!updateProposalUseCase) {
    const proposalRepository = makeProposalRepository();
    const auditLogRepository = makeAuditLogRepository();
    updateProposalUseCase = new UpdateProposalUseCase(
      proposalRepository,
      auditLogRepository
    );
  }

  return updateProposalUseCase;
}

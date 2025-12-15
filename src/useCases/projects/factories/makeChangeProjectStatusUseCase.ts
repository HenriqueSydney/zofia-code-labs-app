import { makeProjectRepository } from "@/repositories/factories/makeProjectRepository";
import { ChangeProjectStatusUseCase } from "../ChangeProjectStatusUseCase";
import { makeProjectNotesRepository } from "@/repositories/factories/makeProjectNotesRepository";
import { makeAuditLogRepository } from "@/repositories/factories/makeAuditLogRepository";

let changeProjectStatusUseCase: ChangeProjectStatusUseCase;

export function makeChangeProjectStatusUseCase() {
  if (!changeProjectStatusUseCase) {
    const projectRepository = makeProjectRepository();
    const projectNotesRepository = makeProjectNotesRepository();
    const auditLogRepository = makeAuditLogRepository();
    changeProjectStatusUseCase = new ChangeProjectStatusUseCase(
      projectRepository,
      projectNotesRepository,
      auditLogRepository
    );
  }

  return changeProjectStatusUseCase;
}

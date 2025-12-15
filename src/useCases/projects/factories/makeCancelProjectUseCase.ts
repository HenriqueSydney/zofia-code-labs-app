import { makeProjectRepository } from "@/repositories/factories/makeProjectRepository";
import { CancelProjectUseCase } from "../cancelProjectUseCase";

let cancelProjectUseCase: CancelProjectUseCase;

export function makeCancelProjectUseCase() {
  if (!cancelProjectUseCase) {
    const projectRepository = makeProjectRepository();
    cancelProjectUseCase = new CancelProjectUseCase(projectRepository);
  }

  return cancelProjectUseCase;
}

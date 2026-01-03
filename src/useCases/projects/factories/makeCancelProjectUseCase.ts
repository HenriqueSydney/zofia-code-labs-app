import { makeProjectRepository } from "@/repositories/factories/makeProjectRepository";
import { CancelProjectUseCase } from "../CancelProjectUseCase";

let cancelProjectUseCase: CancelProjectUseCase;

export function makeCancelProjectUseCase() {
  if (!cancelProjectUseCase) {
    const projectRepository = makeProjectRepository();
    cancelProjectUseCase = new CancelProjectUseCase(projectRepository);
  }

  return cancelProjectUseCase;
}

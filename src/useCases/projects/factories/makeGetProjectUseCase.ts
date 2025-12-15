import { makeProjectRepository } from "@/repositories/factories/makeProjectRepository";
import { GetProjectUseCase } from "../getProjectUseCase";

let getProjectUseCase: GetProjectUseCase;

export function makeGetProjectUseCase() {
  if (!getProjectUseCase) {
    const projectRepository = makeProjectRepository();
    getProjectUseCase = new GetProjectUseCase(projectRepository);
  }

  return getProjectUseCase;
}

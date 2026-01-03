import { makeProjectRepository } from "@/repositories/factories/makeProjectRepository";
import { GetProjectBySlugUseCase } from "../GetProjectBySlugUseCase";

let getProjectBySlugUseCase: GetProjectBySlugUseCase;

export function makeGetProjectBySlugUseCase() {
  if (!getProjectBySlugUseCase) {
    const projectRepository = makeProjectRepository();
    getProjectBySlugUseCase = new GetProjectBySlugUseCase(projectRepository);
  }

  return getProjectBySlugUseCase;
}

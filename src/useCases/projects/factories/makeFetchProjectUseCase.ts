import { makeProjectRepository } from "@/repositories/factories/makeProjectRepository";
import { FetchProjectUseCase } from "../FetchProjectUseCase";

let fetchProjectUseCase: FetchProjectUseCase;

export function makeFetchProjectUseCase() {
  if (!fetchProjectUseCase) {
    const projectRepository = makeProjectRepository();
    fetchProjectUseCase = new FetchProjectUseCase(projectRepository);
  }

  return fetchProjectUseCase;
}

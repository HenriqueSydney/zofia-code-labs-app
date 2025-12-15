import { makeProjectNotesRepository } from "@/repositories/factories/makeProjectNotesRepository";
import { FetchProjectNotesUseCase } from "../FetchProjectNotesUseCase";
import { makeProjectRepository } from "@/repositories/factories/makeProjectRepository";

let fetchProjectNotesUseCase: FetchProjectNotesUseCase;

export function makeFetchProjectNotesUseCase() {
  if (!fetchProjectNotesUseCase) {
    const projectNotesRepository = makeProjectNotesRepository();
    const projectRepository = makeProjectRepository();
    fetchProjectNotesUseCase = new FetchProjectNotesUseCase(
      projectNotesRepository,
      projectRepository
    );
  }

  return fetchProjectNotesUseCase;
}

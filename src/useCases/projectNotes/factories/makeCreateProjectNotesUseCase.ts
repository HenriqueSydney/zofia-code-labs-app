import { makeProjectNotesRepository } from "@/repositories/factories/makeProjectNotesRepository";
import { CreateProjectNoteUseCase } from "../CreateProjectNoteUseCase";
import { makeProjectRepository } from "@/repositories/factories/makeProjectRepository";

let createProjectNoteUseCase: CreateProjectNoteUseCase;

export function makeCreateProjectNoteUseCase() {
  if (!createProjectNoteUseCase) {
    const projectNoteRepository = makeProjectNotesRepository();
    const projectRepository = makeProjectRepository();
    createProjectNoteUseCase = new CreateProjectNoteUseCase(
      projectNoteRepository,
      projectRepository
    );
  }

  return createProjectNoteUseCase;
}

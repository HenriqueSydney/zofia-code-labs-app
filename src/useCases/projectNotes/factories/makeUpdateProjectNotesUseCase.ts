import { makeProjectNotesRepository } from "@/repositories/factories/makeProjectNotesRepository";
import { UpdateProjectNoteUseCase } from "../UpdateProjectNoteUseCase";
import { makeUserRepository } from "@/repositories/factories/makeUserRepository";

let updateProjectNoteUseCase: UpdateProjectNoteUseCase;

export function makeUpdateProjectNoteUseCase() {
  if (!updateProjectNoteUseCase) {
    const projectNoteRepository = makeProjectNotesRepository();
    updateProjectNoteUseCase = new UpdateProjectNoteUseCase(
      projectNoteRepository,
    );
  }

  return updateProjectNoteUseCase;
}

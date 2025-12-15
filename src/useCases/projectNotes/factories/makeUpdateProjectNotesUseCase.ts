import { makeProjectNotesRepository } from "@/repositories/factories/makeProjectNotesRepository";
import { UpdateProjectNoteUseCase } from "../UpdateProjectNoteUseCase";
import { makeUserRepository } from "@/repositories/factories/makeUserRepository";

let updateProjectNoteUseCase: UpdateProjectNoteUseCase;

export function makeUpdateProjectNoteUseCase() {
  if (!updateProjectNoteUseCase) {
    const projectNoteRepository = makeProjectNotesRepository();
    const userRepository = makeUserRepository();
    updateProjectNoteUseCase = new UpdateProjectNoteUseCase(
      projectNoteRepository,
      userRepository
    );
  }

  return updateProjectNoteUseCase;
}

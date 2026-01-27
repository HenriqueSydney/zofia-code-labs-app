import { makeProjectNotesRepository } from "@/repositories/factories/makeProjectNotesRepository";
import { RemoveProjectNoteUseCase } from "../RemoveProjectNoteUseCase";
import { makeUserRepository } from "@/repositories/factories/makeUserRepository";

let removeProjectNoteUseCase: RemoveProjectNoteUseCase;

export function makeRemoveProjectNoteUseCase() {
  if (!removeProjectNoteUseCase) {
    const projectNoteRepository = makeProjectNotesRepository();
    removeProjectNoteUseCase = new RemoveProjectNoteUseCase(
      projectNoteRepository,
    );
  }

  return removeProjectNoteUseCase;
}

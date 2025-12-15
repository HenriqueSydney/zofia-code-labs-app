import { AppError } from "@/errors/AppError";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { date } from "@/lib/dayjs";
import { IProjectNotesRepository } from "@/repositories/IProjectNotesRepository";
import { IUserRepository } from "@/repositories/IUsersRepository";

interface RemoveProjectNoteUseCaseRequest {
  id: string;
  projectId: string;
  userId: string;
}

export class RemoveProjectNoteUseCase {
  constructor(
    private projectNotesRepository: IProjectNotesRepository,
    private userRepository: IUserRepository
  ) {}

  async execute({
    id,
    projectId,
    userId,
  }: RemoveProjectNoteUseCaseRequest): Promise<void> {
    const noteExists = await this.projectNotesRepository.findProjectNoteById(
      id
    );

    if (!noteExists) throw new AppError("Observação não localizada");

    if (noteExists.projectId !== projectId) {
      throw new AppError(
        "Ops! Um erro aparentemente ocorreu ao tentar editar a observação. Tente novamente mais tarde"
      );
    }

    const canRemove = noteExists.updatedAt
      ? date().diff(date(noteExists.updatedAt), "minute") < 30
      : date().diff(date(noteExists.createdAt), "minute") < 30;

    if (!canRemove) {
      throw new AppError(
        "Observação não pode ser mais removida. Período para remoção já se expirou"
      );
    }

    await checkUserPermissionForAsset(
      "projectNotes",
      userId,
      { organizationId: noteExists.project.organizationId },
      "DELETE"
    );

    await this.projectNotesRepository.delete(id);
  }
}

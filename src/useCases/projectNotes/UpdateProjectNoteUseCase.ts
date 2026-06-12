import { ResourceNotFoundError, BusinessRuleError, ValidationError } from "@/errors";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { date } from "@/lib/dayjs";
import {
  IProjectNotesRepository,
  ProjectNotesWithDetails,
} from "@/repositories/IProjectNotesRepository";
import { IUserRepository } from "@/repositories/IUsersRepository";

interface UpdateUpdateProjectNoteUseCaseRequest {
  id: string;
  content: string;
  projectId: string;
  userId: string;
}

export class UpdateProjectNoteUseCase {
  constructor(private projectNotesRepository: IProjectNotesRepository) {}

  async execute({
    id,
    content,
    projectId,
    userId,
  }: UpdateUpdateProjectNoteUseCaseRequest): Promise<ProjectNotesWithDetails> {
    const noteExists =
      await this.projectNotesRepository.findProjectNoteById(id);

    if (!noteExists) throw new ResourceNotFoundError("Observação não localizada");

    const canEdit = noteExists.updatedAt
      ? date().diff(date(noteExists.updatedAt), "minute") < 30
      : date().diff(date(noteExists.createdAt), "minute") < 30;

    if (!canEdit) {
      throw new BusinessRuleError("Observação não pode ser mais editada. Período para edição já se expirou");
    }

    if (noteExists.projectId !== projectId) {
      throw new ValidationError("Ops! Um erro aparentemente ocorreu ao tentar editar a observação. Tente novamente mais tarde");
    }

    if (noteExists.userId !== userId) {
      throw new ValidationError("Apenas o próprio usuário pode editar a observação");
    }

    await checkUserPermissionForAsset(
      "projectNotes",
      userId,
      { organizationId: noteExists.project.organizationId, ...noteExists },
      "DELETE",
    );

    await this.projectNotesRepository.update(id, {
      content,
    });

    return noteExists;
  }
}

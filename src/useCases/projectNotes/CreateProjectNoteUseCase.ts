import { AppError } from "@/errors/AppError";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { IProjectNotesRepository } from "@/repositories/IProjectNotesRepository";
import { IProjectsRepository } from "@/repositories/IProjectsRepository";

interface CreateCreateProjectNoteUseCaseRequest {
  content: string;
  projectId: string;
  userId: string;
}

export class CreateProjectNoteUseCase {
  constructor(
    private projectNotesRepository: IProjectNotesRepository,
    private projectRepository: IProjectsRepository
  ) {}

  async execute({
    content,
    projectId,
    userId,
  }: CreateCreateProjectNoteUseCaseRequest): Promise<void> {
    const projectExists = await this.projectRepository.findById(projectId);

    if (!projectExists) throw new AppError("Projeto não localizado");

    await checkUserPermissionForAsset('projectNotes', userId, projectExists, "CREATE");

    await this.projectNotesRepository.create({
      content,
      projectId,
      userId,
    });
  }
}

import { PrismaToPlain } from "@/@types/PrismaToPlain";
import { AppError } from "@/errors/AppError";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import {
  IProjectNotesRepository,
  ProjectNotesWithDetails,
} from "@/repositories/IProjectNotesRepository";
import { IProjectsRepository } from "@/repositories/IProjectsRepository";

interface IFetchProjectNotesUseCaseParams {
  query?: string;
  projectId: string;
  page?: number;
  numberPerPage?: number;
  userId: string;
}

export class FetchProjectNotesUseCase {
  constructor(
    private projectNotesRepository: IProjectNotesRepository,
    private projectRepository: IProjectsRepository
  ) {}

  async execute({
    projectId,
    query,
    numberPerPage,
    page,
    userId,
  }: IFetchProjectNotesUseCaseParams): Promise<{
    totalOfRegisters: number;
    projectNotes: PrismaToPlain<ProjectNotesWithDetails>[];
  }> {
    const projectExists = await this.projectRepository.findById(projectId);

    if (!projectExists) throw new AppError("Projeto não localizado");

    await checkUserPermissionForAsset(
      "projectNotes",
      userId,
      projectExists,
      "READ"
    );

    const projectNotes =
      await this.projectNotesRepository.fetchProjectNotesByProjectId(
        projectId,
        query,
        { numberPerPage, page }
      );

    return projectNotes;
  }
}

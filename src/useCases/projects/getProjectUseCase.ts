import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import {
  IProjectsRepository,
  ProjectWithDetails,
} from "@/repositories/IProjectsRepository";

interface IGetProjectUseCaseParams {
  projectId: string;
  userId: string;
}

export class GetProjectUseCase {
  constructor(private projectsRepository: IProjectsRepository) {}

  async execute({
    projectId,
    userId,
  }: IGetProjectUseCaseParams): Promise<{ project: ProjectWithDetails }> {
    const project = await this.projectsRepository.findById(projectId);

    if (!project) {
      throw new Error("Projeto não encontrado.");
    }

    await checkUserPermissionForAsset("project", userId, project, "READ");

    return { project };
  }
}

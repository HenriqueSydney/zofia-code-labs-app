import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import {
  IProjectsRepository,
  ProjectWithDetails,
} from "@/repositories/IProjectsRepository";

interface IGetProjectBySlugUseCaseParams {
  slug: string;
  userId: string;
}

export class GetProjectBySlugUseCase {
  constructor(private projectsRepository: IProjectsRepository) {}

  async execute({
    slug,
    userId,
  }: IGetProjectBySlugUseCaseParams): Promise<{ project: ProjectWithDetails }> {
    const project = await this.projectsRepository.findBySlug(slug);

    if (!project) {
      throw new Error("Projeto não encontrado.");
    }

    await checkUserPermissionForAsset("project", userId, project, "READ");

    return { project };
  }
}

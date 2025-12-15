import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import {
  IProjectsRepository,
  ProjectWithDetails,
} from "@/repositories/IProjectsRepository";

interface IFetchProjectUseCaseParams {
  query?: string;
  organizationId: string;
  page?: number;
  numberPerPage?: number;
  userId: string;
}

export class FetchProjectUseCase {
  constructor(private projectsRepository: IProjectsRepository) {}

  async execute({
    organizationId,
    query,
    numberPerPage,
    page,
    userId,
  }: IFetchProjectUseCaseParams): Promise<{
    totalOfRegisters: number;
    projects: Omit<ProjectWithDetails, "projectServices">[];
  }> {
    await checkUserPermissionForAsset(
      "project",
      userId,
      { organizationId: organizationId },
      "READ"
    );
    const projects = await this.projectsRepository.findAll(
      { query, organizationId },
      { numberPerPage, page }
    );

    return projects;
  }
}

import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import {
  IProjectsRepository,
  ProjectWithDetails,
} from "@/repositories/IProjectsRepository";

interface FetchProjectsFilter {
  query?: string;
  clientId?: string;
  clientSlug?: string;
}

interface IFetchProjectUseCaseParams {
  filter?: FetchProjectsFilter;
  organizationId: string;
  clientId?: string;
  page?: number;
  numberPerPage?: number;
  userId: string;
}

export class FetchProjectUseCase {
  constructor(private projectsRepository: IProjectsRepository) {}

  async execute({
    organizationId,
    filter,
    numberPerPage,
    page,
    userId,
  }: IFetchProjectUseCaseParams): Promise<{
    totalOfRegisters: number;
    projects: Omit<ProjectWithDetails, "projectServices" | "proposal">[];
  }> {
    await checkUserPermissionForAsset(
      "project",
      userId,
      { organizationId: organizationId },
      "READ"
    );
    const projects = await this.projectsRepository.findAll(
      { organizationId, ...filter },
      { numberPerPage, page }
    );

    return projects;
  }
}

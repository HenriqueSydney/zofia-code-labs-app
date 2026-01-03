import { Pagination } from "@/@types/Pagination";
import { AppError } from "@/errors/AppError";
import { BacklogStatus, BacklogPriority } from "@/generated/prisma/client";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import {
  IBacklogItemsRepository,
  BacklogItemWithDetails,
} from "@/repositories/IBacklogItemsRepository";
import { IProjectsRepository } from "@/repositories/IProjectsRepository";

interface ListBacklogItemsRequest {
  projectId: string;
  query?: string;
  status?: BacklogStatus | "ALL" | BacklogStatus[];
  priority?: BacklogPriority | "ALL";
  assigneeId?: string | null;
  sprintId?: string | null;
  page?: number;
  numberPerPage?: number;
  userId: string;
}

export interface ListBacklogItemsResponse {
  items: BacklogItemWithDetails[];
  totalOfRegisters: number;
  totalPoints: number;
}

export class ListBacklogItemsUseCase {
  constructor(
    private backlogItemsRepository: IBacklogItemsRepository,
    private projectsRepository: IProjectsRepository
  ) {}

  async execute({
    projectId,
    query,
    status,
    priority,
    assigneeId,
    sprintId,
    page,
    numberPerPage,
    userId,
  }: ListBacklogItemsRequest): Promise<ListBacklogItemsResponse> {
    const doesProjectExists = await this.projectsRepository.findById(projectId);

    if (!doesProjectExists) {
      throw new AppError("Projeto não localizado");
    }

    await checkUserPermissionForAsset(
      "backlog",
      userId,
      doesProjectExists,
      "READ"
    );
    const pagination: Pagination | undefined =
      page && numberPerPage ? { page, numberPerPage } : undefined;

    const { items, totalOfRegisters, totalPoints } =
      await this.backlogItemsRepository.findAll(
        {
          projectId,
          query,
          status: status === "ALL" || !status ? null : status,
          priority: priority === "ALL" || !priority ? null : priority,
          assigneeId,
          sprintId,
        },
        pagination
      );

    return {
      items,
      totalPoints,
      totalOfRegisters,
    };
  }
}

import { IProjectsRepository } from "../IProjectsRepository";
import { PrismaProjectsRepository } from "../prisma/PrismaProjectsRepository";

let projectRepo: IProjectsRepository | null = null;

export function makeProjectRepository() {
  if (!projectRepo) {
    projectRepo = new PrismaProjectsRepository();
  }
  return projectRepo;
}

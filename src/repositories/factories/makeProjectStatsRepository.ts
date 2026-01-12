import { IProjectStatsRepository } from "../IProjectStatsRepository";
import { PrismaProjectStatsRepository } from "../prisma/PrismaProjectStatsRepository";

let projectstatsRepo: IProjectStatsRepository | null = null;

export function makeProjectStatsRepository() {
  if (!projectstatsRepo) {
    projectstatsRepo = new PrismaProjectStatsRepository();
  }
  return projectstatsRepo;
}

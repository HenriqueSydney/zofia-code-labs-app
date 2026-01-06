import { IProjectIntegrationRepository } from "../IProjectIntegrationRepository";
import { PrismaProjectIntegrationRepository } from "../prisma/PrismaProjectIntegrationRepository";

let projectintegrationRepo: IProjectIntegrationRepository | null = null;

export function makeProjectIntegrationRepository() {
  if (!projectintegrationRepo) {
    projectintegrationRepo = new PrismaProjectIntegrationRepository();
  }
  return projectintegrationRepo;
}

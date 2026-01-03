import { IOrganizationIntegrationRepository } from "../IOrganizationIntegrationRepository";
import { PrismaOrganizationIntegrationRepository } from "../prisma/PrismaOrganizationIntegrationRepository";

let organizationIntegrationRepo: IOrganizationIntegrationRepository | null =
  null;

export function makeOrganizationIntegrationRepository() {
  if (!organizationIntegrationRepo) {
    organizationIntegrationRepo = new PrismaOrganizationIntegrationRepository();
  }
  return organizationIntegrationRepo;
}

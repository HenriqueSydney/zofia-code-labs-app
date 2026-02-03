import { IOrganizationsRepository } from "../IOrganizationRepository";
import { PrismaOrganizationsRepository } from "../prisma/PrismaOrganizationRepository";

let organizationRepo: IOrganizationsRepository | null = null;

export function makeOrganizationRepository() {
  if (!organizationRepo) {
    organizationRepo = new PrismaOrganizationsRepository();
  }
  return organizationRepo;
}

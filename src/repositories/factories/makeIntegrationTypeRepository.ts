import { IIntegrationTypeRepository } from "../IIntegrationTypeRepository";
import { PrismaIntegrationTypeRepository } from "../prisma/PrismaIntegrationTypeRepository";

let integrationtypeRepo: IIntegrationTypeRepository | null = null;

export function makeIntegrationTypeRepository() {
  if (!integrationtypeRepo) {
    integrationtypeRepo = new PrismaIntegrationTypeRepository();
  }
  return integrationtypeRepo;
}

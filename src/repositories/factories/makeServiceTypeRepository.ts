import { IServiceTypeRepository } from "../IServiceTypeRepository";
import { PrismaServiceTypeRepository } from "../prisma/PrismaServiceTypeRepository";

let serviceTypeRepository: IServiceTypeRepository | null = null;

export function makeServiceTypeRepository() {
  if (!serviceTypeRepository) {
    serviceTypeRepository = new PrismaServiceTypeRepository();
  }
  return serviceTypeRepository;
}

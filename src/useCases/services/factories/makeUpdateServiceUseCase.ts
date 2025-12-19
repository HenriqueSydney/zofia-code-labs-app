import { PrismaServiceTypeRepository } from "@/repositories/prisma/PrismaServiceTypeRepository";
import { UpdateServiceTypeUseCase } from "../UpdateServiceTypeUseCase";
import { makeServiceTypeRepository } from "@/repositories/factories/makeServiceTypeRepository";

let updateServiceTypeUseCase: UpdateServiceTypeUseCase;

export function makeUpdateServiceTypeUseCase() {
  if (!updateServiceTypeUseCase) {
    const serviceTypeRepository = makeServiceTypeRepository()
    updateServiceTypeUseCase = new UpdateServiceTypeUseCase(
      serviceTypeRepository
    );
  }

  return updateServiceTypeUseCase;
}

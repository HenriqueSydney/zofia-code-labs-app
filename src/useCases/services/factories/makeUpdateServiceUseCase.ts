import { PrismaServiceTypeRepository } from "@/repositories/prisma/PrismaServiceTypeRepository";
import { UpdateServiceTypeUseCase } from "../UpdateServiceTypeUseCase";

let updateServiceTypeUseCase: UpdateServiceTypeUseCase;

export function makeUpdateServiceTypeUseCase() {
  if (!updateServiceTypeUseCase) {
    const serviceTypeRepository = new PrismaServiceTypeRepository();
    updateServiceTypeUseCase = new UpdateServiceTypeUseCase(
      serviceTypeRepository
    );
  }

  return updateServiceTypeUseCase;
}

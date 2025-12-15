import { PrismaServiceTypeRepository } from "@/repositories/prisma/PrismaServiceTypeRepository";
import { DeleteServiceTypeUseCase } from "../DeleteServiceTypeUseCase";

let deleteServiceTypeUseCase: DeleteServiceTypeUseCase;

export function makeDeleteServiceTypeUseCase() {
  if (!deleteServiceTypeUseCase) {
    const serviceTypeRepository = new PrismaServiceTypeRepository();
    deleteServiceTypeUseCase = new DeleteServiceTypeUseCase(
      serviceTypeRepository
    );
  }

  return deleteServiceTypeUseCase;
}

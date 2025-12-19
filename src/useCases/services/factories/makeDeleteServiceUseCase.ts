import { PrismaServiceTypeRepository } from "@/repositories/prisma/PrismaServiceTypeRepository";
import { DeleteServiceTypeUseCase } from "../DeleteServiceTypeUseCase";
import { makeServiceTypeRepository } from "@/repositories/factories/makeServiceTypeRepository";

let deleteServiceTypeUseCase: DeleteServiceTypeUseCase;

export function makeDeleteServiceTypeUseCase() {
  if (!deleteServiceTypeUseCase) {
    const serviceTypeRepository = makeServiceTypeRepository()
    deleteServiceTypeUseCase = new DeleteServiceTypeUseCase(
      serviceTypeRepository
    );
  }

  return deleteServiceTypeUseCase;
}

import { PrismaServiceTypeRepository } from "@/repositories/prisma/PrismaServiceTypeRepository";
import { FetchServiceTypeUseCase } from "../FetchServiceTypeUseCase";

let fetchServiceTypeUseCase: FetchServiceTypeUseCase;

export function makeFetchServiceUseCase() {
  if (!fetchServiceTypeUseCase) {
    const serviceTypeRepository = new PrismaServiceTypeRepository();
    fetchServiceTypeUseCase = new FetchServiceTypeUseCase(
      serviceTypeRepository
    );
  }

  return fetchServiceTypeUseCase;
}

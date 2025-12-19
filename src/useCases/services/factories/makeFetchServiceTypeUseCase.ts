
import { FetchServiceTypeUseCase } from "../FetchServiceTypeUseCase";
import { makeServiceTypeRepository } from "@/repositories/factories/makeServiceTypeRepository";

let fetchServiceTypeUseCase: FetchServiceTypeUseCase;

export function makeFetchServiceUseCase() {
  if (!fetchServiceTypeUseCase) {
    const serviceTypeRepository = makeServiceTypeRepository()
    fetchServiceTypeUseCase = new FetchServiceTypeUseCase(
      serviceTypeRepository
    );
  }

  return fetchServiceTypeUseCase;
}

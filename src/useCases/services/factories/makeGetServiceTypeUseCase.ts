import { GetServiceTypeUseCase } from "../GetServiceTypeUseCase";
import { makeServiceTypeRepository } from "@/repositories/factories/makeServiceTypeRepository";

let getServiceTypeUseCase: GetServiceTypeUseCase;

export function makeGetServiceUseCase() {
  if (!getServiceTypeUseCase) {
    const serviceTypeRepository = makeServiceTypeRepository();
    getServiceTypeUseCase = new GetServiceTypeUseCase(serviceTypeRepository);
  }

  return getServiceTypeUseCase;
}

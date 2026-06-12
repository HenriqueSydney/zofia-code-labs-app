import { makeClientEmployeesRepository } from "@/repositories/factories/makeClientEmployeesRepository";
import { makeUserRepository } from "@/repositories/factories/makeUserRepository";
import { ProvisionClientPortalOwnerUseCase } from "../ProvisionClientPortalOwnerUseCase";

let provisionClientPortalOwnerUseCase: ProvisionClientPortalOwnerUseCase;

export function makeProvisionClientPortalOwnerUseCase() {
  if (!provisionClientPortalOwnerUseCase) {
    provisionClientPortalOwnerUseCase = new ProvisionClientPortalOwnerUseCase(
      makeClientEmployeesRepository(),
      makeUserRepository(),
    );
  }
  return provisionClientPortalOwnerUseCase;
}

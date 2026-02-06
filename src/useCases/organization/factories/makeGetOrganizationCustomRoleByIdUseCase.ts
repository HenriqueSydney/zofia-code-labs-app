import { makeOrganizationRepository } from "@/repositories/factories/makeOrganizationRepository";
import { GetOrganizationCustomRoleByIdUseCase } from "../GetOrganizationCustomRoleByIdUseCase";

let getOrganizationCustomRoleByIdUseCase: GetOrganizationCustomRoleByIdUseCase;

export function makeGetOrganizationCustomRoleByIdUseCase() {
  if (!getOrganizationCustomRoleByIdUseCase) {
    const organizationRepository = makeOrganizationRepository();
    getOrganizationCustomRoleByIdUseCase =
      new GetOrganizationCustomRoleByIdUseCase(organizationRepository);
  }

  return getOrganizationCustomRoleByIdUseCase;
}

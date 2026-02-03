import { makeOrganizationRepository } from "@/repositories/factories/makeOrganizationRepository";
import { CreateOrganizationCustomRoleUseCase } from "../CreateOrganizationCustomRoleUseCase";

let createOrganizationCustomRoleUseCase: CreateOrganizationCustomRoleUseCase;

export function makeCreateOrganizationCustomRoleUseCase() {
  if (!createOrganizationCustomRoleUseCase) {
    const organizationRepository = makeOrganizationRepository();
    createOrganizationCustomRoleUseCase =
      new CreateOrganizationCustomRoleUseCase(organizationRepository);
  }

  return createOrganizationCustomRoleUseCase;
}

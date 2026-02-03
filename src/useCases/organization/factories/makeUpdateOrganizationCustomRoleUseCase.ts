import { makeOrganizationRepository } from "@/repositories/factories/makeOrganizationRepository";
import { UpdateOrganizationCustomRoleUseCase } from "../UpdateOrganizationCustomRoleUseCase";

let updateOrganizationCustomRoleUseCase: UpdateOrganizationCustomRoleUseCase;

export function makeUpdateOrganizationCustomRoleUseCase() {
  if (!updateOrganizationCustomRoleUseCase) {
    const organizationRepository = makeOrganizationRepository();
    updateOrganizationCustomRoleUseCase =
      new UpdateOrganizationCustomRoleUseCase(organizationRepository);
  }

  return updateOrganizationCustomRoleUseCase;
}

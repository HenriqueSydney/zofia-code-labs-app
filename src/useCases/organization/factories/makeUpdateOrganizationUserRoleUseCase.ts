import { makeOrganizationRepository } from "@/repositories/factories/makeOrganizationRepository";
import { UpdateOrganizationUserRoleUseCase } from "../UpdateOrganizationUserRoleUseCase";

let updateOrganizationUserRoleUseCase: UpdateOrganizationUserRoleUseCase;

export function makeUpdateOrganizationUserRoleUseCase() {
  if (!updateOrganizationUserRoleUseCase) {
    const organizationRepository = makeOrganizationRepository();
    updateOrganizationUserRoleUseCase = new UpdateOrganizationUserRoleUseCase(
      organizationRepository,
    );
  }

  return updateOrganizationUserRoleUseCase;
}

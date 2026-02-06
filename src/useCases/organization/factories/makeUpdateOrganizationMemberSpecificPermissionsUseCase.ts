import { makeOrganizationRepository } from "@/repositories/factories/makeOrganizationRepository";
import { UpdateOrganizationMemberSpecificPermissionsUseCase } from "../UpdateOrganizationMemberSpecificPermissionsUseCase";

let updateOrganizationMemberSpecificPermissionsUseCase: UpdateOrganizationMemberSpecificPermissionsUseCase;

export function makeUpdateOrganizationMemberSpecificPermissionsUseCase() {
  if (!updateOrganizationMemberSpecificPermissionsUseCase) {
    const organizationRepository = makeOrganizationRepository();
    updateOrganizationMemberSpecificPermissionsUseCase =
      new UpdateOrganizationMemberSpecificPermissionsUseCase(
        organizationRepository,
      );
  }

  return updateOrganizationMemberSpecificPermissionsUseCase;
}

import { makeOrganizationRepository } from "@/repositories/factories/makeOrganizationRepository";
import { DeleteOrganizationCustomRoleUseCase } from "../DeleteOrganizationCustomRoleUseCase";

let deleteOrganizationCustomRoleUseCase: DeleteOrganizationCustomRoleUseCase;

export function makeDeleteOrganizationCustomRoleUseCase() {
  if (!deleteOrganizationCustomRoleUseCase) {
    const organizationRepository = makeOrganizationRepository();
    deleteOrganizationCustomRoleUseCase =
      new DeleteOrganizationCustomRoleUseCase(organizationRepository);
  }

  return deleteOrganizationCustomRoleUseCase;
}

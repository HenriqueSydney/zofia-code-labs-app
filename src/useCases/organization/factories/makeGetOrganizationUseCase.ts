import { makeOrganizationRepository } from "@/repositories/factories/makeOrganizationRepository";
import { GetOrganizationUseCase } from "../GetOrganizationUseCase";

let getOrganizationUseCase: GetOrganizationUseCase;

export function makeGetOrganizationUseCase() {
  if (!getOrganizationUseCase) {
    const organizationRepository = makeOrganizationRepository();
    getOrganizationUseCase = new GetOrganizationUseCase(organizationRepository);
  }

  return getOrganizationUseCase;
}

import { makeOrganizationRepository } from "@/repositories/factories/makeOrganizationRepository";
import { makeUserRepository } from "@/repositories/factories/makeUserRepository";
import { ActivateOrganizationMemberUseCase } from "../ActivateOrganizationMemberUseCase";

export function makeActivateOrganizationMemberUseCase() {
  return new ActivateOrganizationMemberUseCase(
    makeOrganizationRepository(),
    makeUserRepository(),
  );
}

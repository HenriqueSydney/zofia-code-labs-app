import { makeOrganizationRepository } from "@/repositories/factories/makeOrganizationRepository";
import { makeActivateOrganizationMemberUseCase } from "@/useCases/organization/factories/makeActivateOrganizationMemberUseCase";
import { ActivatePendingMembersOnLoginUseCase } from "../ActivatePendingMembersOnLoginUseCase";

let activatePendingMembersOnLoginUseCase: ActivatePendingMembersOnLoginUseCase;

export function makeActivatePendingMembersOnLoginUseCase() {
  if (!activatePendingMembersOnLoginUseCase) {
    activatePendingMembersOnLoginUseCase =
      new ActivatePendingMembersOnLoginUseCase(
        makeOrganizationRepository(),
        makeActivateOrganizationMemberUseCase(),
      );
  }

  return activatePendingMembersOnLoginUseCase;
}

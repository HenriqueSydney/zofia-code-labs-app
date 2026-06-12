import { makeOrganizationRepository } from "@/repositories/factories/makeOrganizationRepository";
import { makeUserRepository } from "@/repositories/factories/makeUserRepository";
import { makeVerificationTokenRepository } from "@/repositories/factories/makeVerificationTokenRepository";
import { InviteOrganizationMemberUseCase } from "../InviteOrganizationMemberUseCase";

let inviteOrganizationMemberUseCase: InviteOrganizationMemberUseCase;

export function makeInviteOrganizationMemberUseCase() {
  if (!inviteOrganizationMemberUseCase) {
    inviteOrganizationMemberUseCase = new InviteOrganizationMemberUseCase(
      makeOrganizationRepository(),
      makeUserRepository(),
      makeVerificationTokenRepository(),
    );
  }

  return inviteOrganizationMemberUseCase;
}

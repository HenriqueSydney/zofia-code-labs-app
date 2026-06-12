import { makeOrganizationRepository } from "@/repositories/factories/makeOrganizationRepository";
import { makeUserRepository } from "@/repositories/factories/makeUserRepository";
import { makeVerificationTokenRepository } from "@/repositories/factories/makeVerificationTokenRepository";
import { AcceptOrganizationInviteUseCase } from "../AcceptOrganizationInviteUseCase";

export function makeAcceptOrganizationInviteUseCase() {
  return new AcceptOrganizationInviteUseCase(
    makeVerificationTokenRepository(),
    makeUserRepository(),
    makeOrganizationRepository(),
  );
}

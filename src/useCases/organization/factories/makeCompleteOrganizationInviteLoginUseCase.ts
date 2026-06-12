import { makeOrganizationRepository } from "@/repositories/factories/makeOrganizationRepository";
import { makeUserRepository } from "@/repositories/factories/makeUserRepository";
import { makeVerificationTokenRepository } from "@/repositories/factories/makeVerificationTokenRepository";
import { CompleteOrganizationInviteLoginUseCase } from "../CompleteOrganizationInviteLoginUseCase";
import { makeActivateOrganizationMemberUseCase } from "./makeActivateOrganizationMemberUseCase";

export function makeCompleteOrganizationInviteLoginUseCase() {
  return new CompleteOrganizationInviteLoginUseCase(
    makeVerificationTokenRepository(),
    makeUserRepository(),
    makeOrganizationRepository(),
    makeActivateOrganizationMemberUseCase(),
  );
}

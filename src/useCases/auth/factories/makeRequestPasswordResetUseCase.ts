import { makeUserRepository } from "@/repositories/factories/makeUserRepository";
import { makeVerificationTokenRepository } from "@/repositories/factories/makeVerificationTokenRepository";
import { RequestPasswordResetUseCase } from "../RequestPasswordResetUseCase";

let requestPasswordResetUseCase: RequestPasswordResetUseCase;

export function makeRequestPasswordResetUseCase() {
  if (!requestPasswordResetUseCase) {
    requestPasswordResetUseCase = new RequestPasswordResetUseCase(
      makeUserRepository(),
      makeVerificationTokenRepository(),
    );
  }

  return requestPasswordResetUseCase;
}

import { IVerificationTokenRepository } from "../IVerificationTokenRepository";
import { PrismaVerificationTokenRepository } from "../prisma/PrismaVerificationTokenRepository";

let verificationTokenRepository: IVerificationTokenRepository | null = null;

export function makeVerificationTokenRepository() {
  if (!verificationTokenRepository) {
    verificationTokenRepository = new PrismaVerificationTokenRepository();
  }
  return verificationTokenRepository;
}

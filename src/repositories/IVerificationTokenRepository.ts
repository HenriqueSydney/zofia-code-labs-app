import { VerificationToken } from "@/generated/prisma/client";

export interface IVerificationTokenRepository {
  replaceToken(
    identifier: string,
    token: string,
    expires: Date,
  ): Promise<VerificationToken>;
  findByToken(token: string): Promise<VerificationToken | null>;
  deleteByIdentifier(identifier: string): Promise<void>;
}

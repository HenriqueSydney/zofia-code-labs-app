import { VerificationToken } from "@/generated/prisma/client";
import { IVerificationTokenRepository } from "../IVerificationTokenRepository";

export class InMemoryVerificationTokenRepository
  implements IVerificationTokenRepository
{
  public items: VerificationToken[] = [];

  async replaceToken(
    identifier: string,
    token: string,
    expires: Date,
  ): Promise<VerificationToken> {
    this.items = this.items.filter((item) => item.identifier !== identifier);

    const verificationToken: VerificationToken = {
      identifier,
      token,
      expires,
    };

    this.items.push(verificationToken);
    return verificationToken;
  }

  async findByToken(token: string): Promise<VerificationToken | null> {
    return this.items.find((item) => item.token === token) ?? null;
  }

  async deleteByIdentifier(identifier: string): Promise<void> {
    this.items = this.items.filter((item) => item.identifier !== identifier);
  }
}

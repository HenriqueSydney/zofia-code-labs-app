import { VerificationToken } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { IVerificationTokenRepository } from "../IVerificationTokenRepository";

export class PrismaVerificationTokenRepository
  implements IVerificationTokenRepository
{
  async replaceToken(
    identifier: string,
    token: string,
    expires: Date,
  ): Promise<VerificationToken> {
    await prisma.verificationToken.deleteMany({
      where: { identifier },
    });

    return prisma.verificationToken.create({
      data: {
        identifier,
        token,
        expires,
      },
    });
  }

  async findByToken(token: string): Promise<VerificationToken | null> {
    return prisma.verificationToken.findFirst({
      where: { token },
    });
  }

  async deleteByIdentifier(identifier: string): Promise<void> {
    await prisma.verificationToken.deleteMany({
      where: { identifier },
    });
  }
}

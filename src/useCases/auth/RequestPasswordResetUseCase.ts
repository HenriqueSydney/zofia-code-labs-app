import { randomBytes } from "node:crypto";

import { sendForgotPasswordEmail } from "@/email/send/sendForgotPasswordEmail";
import { date } from "@/lib/dayjs";
import { IUserRepository } from "@/repositories/IUsersRepository";
import { IVerificationTokenRepository } from "@/repositories/IVerificationTokenRepository";
const PASSWORD_RESET_IDENTIFIER_PREFIX = "password-reset:";
const PASSWORD_RESET_TOKEN_TTL_MINUTES = 60;

interface RequestPasswordResetUseCaseRequest {
  email: string;
}

export class RequestPasswordResetUseCase {
  constructor(
    private usersRepository: IUserRepository,
    private verificationTokenRepository: IVerificationTokenRepository,
  ) {}

  async execute({ email }: RequestPasswordResetUseCaseRequest): Promise<void> {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.usersRepository.findUserByEmail(normalizedEmail);

    if (!user) {
      return;
    }

    const token = randomBytes(32).toString("hex");
    const expires = date()
      .add(PASSWORD_RESET_TOKEN_TTL_MINUTES, "minute")
      .toDate();
    const identifier = `${PASSWORD_RESET_IDENTIFIER_PREFIX}${normalizedEmail}`;

    await this.verificationTokenRepository.replaceToken(
      identifier,
      token,
      expires,
    );

    const baseUrl = (
      process.env.BASE_URL ??
      process.env.NEXT_PUBLIC_APP_URL ??
      "http://localhost:3000"
    ).replace(/\/$/, "");
    const resetLink = `${baseUrl}/auth/reset-password?token=${token}`;

    await sendForgotPasswordEmail({
      to: normalizedEmail,
      userName: user.name ?? normalizedEmail,
      resetLink,
      userEmail: normalizedEmail,
    });
  }
}

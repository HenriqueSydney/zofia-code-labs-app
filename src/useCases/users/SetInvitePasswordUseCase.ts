import { ResourceNotFoundError } from "@/errors";
import { sendPasswordChangedEmail } from "@/email/send/sendPasswordChangedEmail";
import { date } from "@/lib/dayjs";
import { IUserRepository } from "@/repositories/IUsersRepository";
import { parseUserAgent } from "@/utils/parseUserAgent";
import { hash } from "bcryptjs";

interface SetInvitePasswordRequest {
  userId: string;
  newPassword: string;
  ipAddress?: string;
  userAgent?: string | null;
}

export class SetInvitePasswordUseCase {
  constructor(private usersRepository: IUserRepository) {}

  async execute({
    userId,
    newPassword,
    ipAddress = "Desconhecido",
    userAgent,
  }: SetInvitePasswordRequest): Promise<void> {
    const user = await this.usersRepository.findUserByIdWithPassword(userId);

    if (!user) {
      throw new ResourceNotFoundError("Usuário não encontrado.");
    }

    const newPasswordHash = await hash(newPassword, 6);

    await this.usersRepository.updatePassword(userId, newPasswordHash);

    const userProfile =
      await this.usersRepository.findUserByIdAndReturnAllInfo(userId);

    if (!userProfile?.email) {
      return;
    }

    const baseUrl = (
      process.env.BASE_URL ??
      process.env.NEXT_PUBLIC_APP_URL ??
      "http://localhost:3000"
    ).replace(/\/$/, "");

    try {
      await sendPasswordChangedEmail({
        to: userProfile.email,
        userName: userProfile.name ?? userProfile.email,
        userEmail: userProfile.email,
        date: date().format("DD [de] MMMM [de] YYYY [às] HH:mm"),
        deviceInfo: parseUserAgent(userAgent ?? null).name,
        ipAddress,
        resetLink: `${baseUrl}/auth/remember-me`,
      });
    } catch (error) {
      console.error("Erro ao enviar confirmação de alteração de senha:", error);
    }
  }
}

import {
  ResourceNotFoundError,
  ValidationError,
  BusinessRuleError,
} from "@/errors";
import { sendPasswordChangedEmail } from "@/email/send/sendPasswordChangedEmail";
import { date } from "@/lib/dayjs";
import { IUserRepository } from "@/repositories/IUsersRepository";
import { parseUserAgent } from "@/utils/parseUserAgent";
import { compare, hash } from "bcryptjs";

interface UpdatePasswordRequest {
  userId: string;
  currentPassword: string;
  newPassword: string;
  ipAddress?: string;
  userAgent?: string | null;
}

export class UpdatePasswordUseCase {
  constructor(private usersRepository: IUserRepository) {}

  async execute({
    userId,
    currentPassword,
    newPassword,
    ipAddress = "Desconhecido",
    userAgent,
  }: UpdatePasswordRequest): Promise<void> {
    // 1. Buscar usuário com a senha atual
    const user = await this.usersRepository.findUserByIdWithPassword(userId);

    if (!user) {
      throw new ResourceNotFoundError("Usuário não encontrado.");
    }

    // 2. Verificar se existe senha cadastrada (caso seja conta apenas social)
    if (!user.passwordHash) {
      throw new ValidationError(
        "Este usuário utiliza login social e não possui senha definida.",
      );
    }

    // 3. Verificar se a senha ATUAL está correta
    const isPasswordCorrect = await compare(currentPassword, user.passwordHash);

    if (!isPasswordCorrect) {
      throw new BusinessRuleError("Senha atual incorreta.");
    }

    // 4. Criptografar a NOVA senha
    const newPasswordHash = await hash(newPassword, 6); // Salt rounds = 6 (padrão seguro/rápido)

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

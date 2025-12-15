import { IUserRepository } from "@/repositories/IUsersRepository";
import { compare, hash } from "bcryptjs"; // ou 'bcrypt'

interface UpdatePasswordRequest {
  userId: string;
  currentPassword: string;
  newPassword: string;
}

export class UpdatePasswordUseCase {
  constructor(private usersRepository: IUserRepository) {}

  async execute({
    userId,
    currentPassword,
    newPassword,
  }: UpdatePasswordRequest): Promise<void> {
    // 1. Buscar usuário com a senha atual
    const user = await this.usersRepository.findUserByIdWithPassword(userId);

    if (!user) {
      throw new Error("Usuário não encontrado.");
    }

    // 2. Verificar se existe senha cadastrada (caso seja conta apenas social)
    if (!user.passwordHash) {
      throw new Error(
        "Este usuário utiliza login social e não possui senha definida."
      );
    }

    // 3. Verificar se a senha ATUAL está correta
    const isPasswordCorrect = await compare(currentPassword, user.passwordHash);

    if (!isPasswordCorrect) {
      throw new Error("Senha atual incorreta.");
    }

    // 4. Criptografar a NOVA senha
    const newPasswordHash = await hash(newPassword, 6); // Salt rounds = 6 (padrão seguro/rápido)

    // 5. Atualizar no banco
    await this.usersRepository.updatePassword(userId, newPasswordHash);
  }
}

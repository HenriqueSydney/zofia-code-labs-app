import { AppError } from "@/errors/AppError";
import {
  IUserRepository,
  UserWithAllInfo,
} from "@/repositories/IUsersRepository";
import { IS3StorageService } from "@/services/s3Client/IS3StorageService";

interface IGetUserAllInfoRequest {
  targetUserId: string; // O ID do usuário que queremos buscar
  authenticatedUserId: string; // O ID do usuário que está fazendo a requisição
}

interface IGetUserAllInfoResponse {
  user: UserWithAllInfo;
}

export class GetUserAllInfoUseCase {
  constructor(
    private usersRepository: IUserRepository,
    private storageService: IS3StorageService,
  ) {}

  async execute({
    targetUserId,
    authenticatedUserId,
  }: IGetUserAllInfoRequest): Promise<IGetUserAllInfoResponse> {
    // 1. Verificação de Segurança: Apenas o próprio usuário pode ver seus dados sensíveis (logs, etc)
    if (targetUserId !== authenticatedUserId) {
      throw new AppError("Usuário não autorizado");
    }

    // 2. Busca os dados completos no banco
    const user =
      await this.usersRepository.findUserByIdAndReturnAllInfo(targetUserId);

    if (!user) {
      throw new AppError("Usuário não localizado");
    }

    // 3. Transformação da Imagem: Gera o Presigned URL se existir uma imagem (key)
    if (user.image) {
      // Verifica se a string já não é uma URL completa (caso use provedores de login social como Google)
      const isExternalUrl = user.image.startsWith("http");

      if (!isExternalUrl) {
        try {
          // Gera uma URL assinada válida por 1 hora (3600 segundos)
          const signedUrl = await this.storageService.getSignedUrl(
            user.image,
            3600,
          );
          user.image = signedUrl;
        } catch (error) {
          console.error(
            `Falha ao gerar URL assinada para o usuário ${user.id}`,
            error,
          );
          // Em caso de erro no Storage, mantemos a key original ou definimos null para não quebrar o front
          user.image = null;
        }
      }
    }

    return {
      user,
    };
  }
}

import { IUserRepository } from "@/repositories/IUsersRepository";
import { IS3StorageService } from "@/services/s3Client/IS3StorageService";
import { v4 as uuidv4 } from "uuid";
interface UpdateAvatarRequest {
  userId: string;
  file: File;
}

export class UpdateAvatarUseCase {
  constructor(
    private usersRepository: IUserRepository,
    private storageService: IS3StorageService
  ) {}

  async execute({ userId, file }: UpdateAvatarRequest) {
    // 1. Gerar nome único para o arquivo (ex: avatars/uuid-nome.png)
    const extension = file.name.split(".").pop();
    const fileName = `avatars/${userId}/${uuidv4()}.${extension}`;

    // 2. Converter File para Buffer (necessário para o AWS SDK no Node environment)
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 3. Upload usando seu serviço existente
    // O seu serviço retorna a URL completa
    const avatarUrl = await this.storageService.upload(
      buffer,
      fileName,
      file.type
    );

    // 4. Persistir no banco de dados
    const user = await this.usersRepository.updateAvatar(userId, avatarUrl);

    return user;
  }
}

import { ResourceNotFoundError } from "@/errors";
import { assertClientAccessForUser } from "@/lib/auth/resolveClientAccess";
import { MemberRole } from "@/generated/prisma/enums";
import {
  IClientsRepository,
  IUpdateClientDTO,
} from "@/repositories/IClientsRepository";
import { IS3StorageService } from "@/services/s3Client/IS3StorageService";
import { prepareFileToUpload } from "@/utils/prepareFileToUpload";

interface UpdateClientUseCaseRequest {
  data: IUpdateClientDTO;
  userId: string;
  memberRole?: MemberRole | null;
}

export class UpdateClientUseCase {
  constructor(
    private clientsRepository: IClientsRepository,
    private storageService: IS3StorageService,
  ) {}

  async execute({ data, userId, memberRole }: UpdateClientUseCaseRequest) {
    const client = await this.clientsRepository.findById(data.id);

    if (!client) {
      throw new ResourceNotFoundError("Cliente não encontrado.");
    }

    await assertClientAccessForUser({
      userId,
      memberRole,
      clientSlug: client.slug,
      client,
      operation: "UPDATE",
    });

    let uploadedDocument: any;
    if (data.file) {
      const folderName = "clientLogo";
      const file = await prepareFileToUpload({ file: data.file, folderName });
      const uploadResult = await this.storageService.upload(
        file.buffer,
        file.key,
        file.mimeType,
      );

      uploadedDocument = {
        url: uploadResult.key,
        originalName: file.originalName,
        extension: file.extension,
      };
    }

    const { file, ...dataWithoutFile } = data;

    return await this.clientsRepository.update(
      dataWithoutFile,
      uploadedDocument,
    );
  }
}

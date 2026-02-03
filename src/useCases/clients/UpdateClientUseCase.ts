import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import {
  IClientsRepository,
  IUpdateClientDTO,
} from "@/repositories/IClientsRepository";
import { IS3StorageService } from "@/services/s3Client/IS3StorageService";
import { prepareFileToUpload } from "@/utils/prepareFileToUpload";

export class UpdateClientUseCase {
  constructor(
    private clientsRepository: IClientsRepository,
    private storageService: IS3StorageService,
  ) {}

  async execute(data: IUpdateClientDTO, userId: string) {
    const client = await this.clientsRepository.findById(data.id);

    if (!client) {
      throw new Error("Cliente não encontrado.");
    }

    await checkUserPermissionForAsset("client", userId, client, "READ");

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

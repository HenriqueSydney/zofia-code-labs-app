import { ValidationError } from "@/errors";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import {
  IClientsRepository,
  ICreateClientDTO,
} from "@/repositories/IClientsRepository";
import { IS3StorageService } from "@/services/s3Client/IS3StorageService";
import { generateSlug } from "@/utils/generateSlug";
import { prepareFileToUpload } from "@/utils/prepareFileToUpload";

export class CreateClientUseCase {
  constructor(
    private clientsRepository: IClientsRepository,
    private storageService: IS3StorageService,
  ) {}

  async execute(data: Omit<ICreateClientDTO, "slug">, userId: string) {
    const existingClient = await this.clientsRepository.findByCnpj(data.cnpj);

    if (existingClient) {
      throw new ValidationError("Empresa com mesmo CNPJ já cadastrada");
    }

    await checkUserPermissionForAsset(
      "client",
      userId,
      { organizationId: data.organizationId },
      "CREATE",
    );

    const slug = generateSlug({ title: data.tradeName });

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
    return await this.clientsRepository.create(
      {
        ...dataWithoutFile,
        slug,
      },
      uploadedDocument,
    );
  }
}

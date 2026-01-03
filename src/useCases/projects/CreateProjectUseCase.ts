import { handleErrors } from "@/errors/handleErrors";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { prisma } from "@/lib/prisma";
import { IProjectsRepository } from "@/repositories/IProjectsRepository";
import { IS3StorageService } from "@/services/s3Client/IS3StorageService";
import { generateSlug } from "@/utils/generateSlug";
import { prepareFileToUpload } from "@/utils/prepareFileToUpload";

interface CreateProjectRequest {
  name: string;
  description: string;
  clientId: string;
  files: File[];
  userId: string;
  organizationId: string;
}

export class CreateProjectUseCase {
  constructor(
    private projectsRepository: IProjectsRepository,
    private storageService: IS3StorageService
  ) {}

  async execute(request: CreateProjectRequest) {
    const { files, ...rawRequestData } = request;

    const slug = generateSlug({ title: rawRequestData.name });
    const folderName = `projects/${slug}`;

    try {
      await checkUserPermissionForAsset(
        "project",
        rawRequestData.userId,
        { organizationId: rawRequestData.organizationId },
        "CREATE"
      );

      let uploadedDocuments: any[] = [];

      if (files && files.length > 0) {
        const preparedFiles = await Promise.all(
          files.map((file) => prepareFileToUpload({ file, folderName }))
        );

        // Upload para o S3 (Rede - Operação lenta)
        // Se qualquer upload falhar, o erro cai no catch e o projeto não é criado no DB
        uploadedDocuments = await Promise.all(
          preparedFiles.map(async (p) => {
            const uploadResult = await this.storageService.upload(
              p.buffer,
              p.key,
              p.mimeType
            );
            return {
              url: uploadResult.key,
              originalName: p.originalName,
              extension: p.extension,
            };
          })
        );
      }

      const project = await prisma.$transaction(async (tx) => {
        const newProject = await this.projectsRepository.create(
          {
            name: rawRequestData.name,
            description: rawRequestData.description,
            clientId: rawRequestData.clientId,
            organizationId: rawRequestData.organizationId,
            createdBy: rawRequestData.userId,
            slug,
            documents: uploadedDocuments,
          },
          tx
        );

        return newProject;
      });

      return project;
    } catch (error) {
      handleErrors(error);
      throw error;
    }
  }
}

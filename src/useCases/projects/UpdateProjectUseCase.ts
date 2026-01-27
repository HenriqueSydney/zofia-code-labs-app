import { handleErrors } from "@/errors/handleErrors";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { IProjectsRepository } from "@/repositories/IProjectsRepository";
import { IS3StorageService } from "@/services/s3Client/IS3StorageService";
import { prepareFileToUpload } from "@/utils/prepareFileToUpload";
import { Priority, ProjectHealth } from "@/generated/prisma/client";
import { date } from "@/lib/dayjs";

interface UpdateProjectRequest {
  id: string;
  userId: string;
  organizationId: string;

  // Dados de atualização
  name?: string;
  description?: string;
  clientId?: string;
  priority?: Priority;
  health?: ProjectHealth;
  totalBudget?: number;
  estimatedStartDate?: Date; // string que virá do form (Date input)
  endDate?: Date; // string que virá do form (Date input)
  tags?: string[];

  newFiles?: File[]; // Arquivos novos
}

export class UpdateProjectUseCase {
  constructor(
    private projectsRepository: IProjectsRepository,
    private storageService: IS3StorageService,
  ) {}

  async execute(request: UpdateProjectRequest) {
    const { newFiles, id, userId, organizationId, ...updateData } = request;

    try {
      // 1. Verifica existência e permissões
      const projectExists = await this.projectsRepository.findById(id);

      if (!projectExists) {
        throw new Error("Projeto não encontrado.");
      }

      await checkUserPermissionForAsset(
        "project",
        userId,
        projectExists,
        "UPDATE",
      );

      // 2. Processamento de Arquivos (Idêntico ao Create)
      let uploadedDocuments: any[] = [];

      if (newFiles && newFiles.length > 0) {
        // Mantém a consistência usando o slug JÁ EXISTENTE do projeto para a pasta
        const folderName = `projects/${projectExists.slug}`;

        // Prepara os arquivos (Buffer, nome limpo, mimeType)
        const preparedFiles = await Promise.all(
          newFiles.map((file) => prepareFileToUpload({ file, folderName })),
        );

        // Upload para o S3
        uploadedDocuments = await Promise.all(
          preparedFiles.map(async (p) => {
            const uploadResult = await this.storageService.upload(
              p.buffer,
              p.key,
              p.mimeType,
            );

            return {
              url: uploadResult.key, // Salva a Key retornada pelo S3/R2
              originalName: p.originalName,
              extension: p.extension,
            };
          }),
        );
      }

      // 3. Atualiza no banco
      // Tratamento de datas se vierem como string do formulário
      const estimatedStartDate = updateData.estimatedStartDate
        ? date(updateData.estimatedStartDate).toDate()
        : undefined;

      const endDate = updateData.endDate
        ? date(updateData.endDate).toDate()
        : undefined;

      const project = await this.projectsRepository.update({
        id,
        ...updateData,
        estimatedStartDate,
        endDate,
        // Só passa documents se houver novos uploads
        documents: uploadedDocuments.length > 0 ? uploadedDocuments : undefined,
      });

      return project;
    } catch (error) {
      handleErrors(error);
      throw error;
    }
  }
}

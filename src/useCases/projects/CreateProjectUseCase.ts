import { handleErrors } from "@/errors/handleErrors";
import { Priority, ProjectHealth } from "@/generated/prisma/enums";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { date } from "@/lib/dayjs";
import { prisma } from "@/lib/prisma";
import { IProjectsRepository } from "@/repositories/IProjectsRepository";
import { IS3StorageService } from "@/services/s3Client/IS3StorageService";
import { generateSlug } from "@/utils/generateSlug";
import { prepareFileToUpload } from "@/utils/prepareFileToUpload";

interface CreateProjectRequest {
  name: string;
  description: string;
  clientId: string;

  priority?: Priority;
  health?: ProjectHealth;
  totalBudget?: number;
  estimatedStartDate?: Date; // string que virá do form (Date input)
  endDate?: Date; // string que virá do form (Date input)
  tags?: string[];

  files: File[];
  userId: string;
  organizationId: string;
}

export class CreateProjectUseCase {
  constructor(
    private projectsRepository: IProjectsRepository,
    private storageService: IS3StorageService,
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
        "CREATE",
      );

      let uploadedDocuments: any[] = [];

      if (files && files.length > 0) {
        const preparedFiles = await Promise.all(
          files.map((file) => prepareFileToUpload({ file, folderName })),
        );

        // Upload para o S3 (Rede - Operação lenta)
        // Se qualquer upload falhar, o erro cai no catch e o projeto não é criado no DB
        uploadedDocuments = await Promise.all(
          preparedFiles.map(async (p) => {
            const uploadResult = await this.storageService.upload(
              p.buffer,
              p.key,
              p.mimeType,
            );
            return {
              url: uploadResult.key,
              originalName: p.originalName,
              extension: p.extension,
            };
          }),
        );
      }

      // 3. Atualiza no banco
      // Tratamento de datas se vierem como string do formulário
      const estimatedStartDate = rawRequestData.estimatedStartDate
        ? date(rawRequestData.estimatedStartDate).toDate()
        : undefined;

      const endDate = rawRequestData.endDate
        ? date(rawRequestData.endDate).toDate()
        : undefined;

      const project = await prisma.$transaction(async (tx) => {
        const newProject = await this.projectsRepository.create(
          {
            name: rawRequestData.name,
            slug,
            description: rawRequestData.description,
            clientId: rawRequestData.clientId,
            organizationId: rawRequestData.organizationId,
            createdBy: rawRequestData.userId,
            priority: rawRequestData.priority,
            health: rawRequestData.health,
            tags: rawRequestData.tags,
            totalBudget: rawRequestData.totalBudget,
            estimatedStartDate,
            endDate,
            documents: uploadedDocuments,
          },
          tx,
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

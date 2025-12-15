import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { IProjectsRepository } from "@/repositories/IProjectsRepository";
import { IS3StorageService } from "@/services/s3Client/IS3StorageService";

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

    const projectInput = {
      name: rawRequestData.name,
      description: rawRequestData.description,
      clientId: rawRequestData.clientId,
      organizationId: rawRequestData.organizationId,
      createdBy: rawRequestData.userId,
      status: "DRAFT",
      budget: 0,
    };

    try {
      await checkUserPermissionForAsset(
        "project",
        projectInput.createdBy,
        { organizationId: projectInput.organizationId },
        "CREATE"
      );

      const project = await this.projectsRepository.create(projectInput);

      if (files && files.length > 0) {
        const folderName = `projects/${project.id}`;

        const uploadPromises = files.map(async (file) => {
          const key = `${folderName}/${Date.now()}-${file.name}`;
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);

          // Upload
          const url = await this.storageService.upload(
            buffer as any,
            key,
            file.type
          );

          // Extração da extensão
          const extension = file.name.split(".").pop() || "";

          // Retorna o objeto com os metadados
          return {
            url: url,
            originalName: file.name,
            extension: extension,
          };
        });

        const uploadedDocuments = await Promise.all(uploadPromises);

        // Atualiza o projeto com a nova estrutura de dados
        if (uploadedDocuments.length > 0) {
          await this.projectsRepository.update({
            id: project.id,
            documents: uploadedDocuments, // Passa o objeto completo, não apenas URLs
          });
        }
      }

      return project;
    } catch (error) {
      console.error("Erro ao criar projeto:", error);
      throw error;
    }
  }
}

import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { IProjectsRepository } from "@/repositories/IProjectsRepository";
import { IS3StorageService } from "@/services/s3Client/IS3StorageService";

interface UpdateProjectRequest {
  id: string;
  name?: string;
  description?: string;
  clientId?: string;
  serviceTypeId?: string;
  newFiles?: File[]; // Apenas novos arquivos a serem adicionados
  userId: string;
}

export class UpdateProjectUseCase {
  constructor(
    private projectsRepository: IProjectsRepository,
    private storageService: IS3StorageService
  ) {}

  async execute(request: UpdateProjectRequest) {
    const { newFiles, id, userId, ...updateData } = request;

    const projectExists = await this.projectsRepository.findById(id);
    if (!projectExists) {
      throw new Error("Projeto não encontrado.");
    }

    await checkUserPermissionForAsset(
      "project",
      userId,
      projectExists,
      "UPDATE"
    );

    let uploadedDocuments: any = undefined;
    // 2. Upload APENAS dos novos arquivos para o R2
    if (newFiles && newFiles.length > 0) {
      // Usa o ID do projeto para organizar a pasta, mantendo consistência
      const folderName = `projects/${projectExists.id}`;

      const uploadPromises = newFiles.map(async (file) => {
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

      uploadedDocuments = await Promise.all(uploadPromises);
    }

    // 3. Atualiza no banco
    // Passamos os dados de texto e o array de NOVAS urls.
    // O Repositório deve ser inteligente para fazer o "connect" ou "create" dessas novas URLs.
    const project = await this.projectsRepository.update({
      id,
      ...updateData,
      documents: uploadedDocuments.length > 0 ? uploadedDocuments : undefined,
    });

    return project;
  }
}

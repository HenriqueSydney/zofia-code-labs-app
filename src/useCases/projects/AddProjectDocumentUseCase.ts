import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { IProjectsRepository } from "@/repositories/IProjectsRepository";
import { IS3StorageService } from "@/services/s3Client/IS3StorageService";

interface AddDocumentsRequest {
  projectId: string;
  files: File[];
  userId: string;
}

export class AddProjectDocumentUseCase {
  constructor(
    private projectsRepository: IProjectsRepository,
    private storageService: IS3StorageService
  ) {}

  async execute({ projectId, files, userId }: AddDocumentsRequest) {
    if (!files || files.length === 0) {
      throw new Error("Nenhum arquivo enviado.");
    }

    // Verifica se o projeto existe antes de fazer upload
    const projectExists = await this.projectsRepository.findById(projectId);
    if (!projectExists) {
      throw new Error("Projeto não encontrado.");
    }

    await checkUserPermissionForAsset(
      "documents",
      userId,
      projectExists,
      "CREATE"
    );

    const folderName = `projects/${projectId}`;

    // Processa os uploads em paralelo
    const uploadPromises = files.map(async (file) => {
      // Cria nome único: timestamp-nomeOriginal
      const key = `${folderName}/${Date.now()}-${file.name}`;

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Upload para o R2
      const url = await this.storageService.upload(
        buffer as any,
        key,
        file.type
      );

      // Extrai a extensão
      const extension = file.name.split(".").pop() || "";

      // Retorna o objeto formatado para o Repository
      return {
        url: url.key,
        originalName: file.name,
        extension: extension,
      };
    });

    // Aguarda todos os uploads finalizarem
    const uploadedDocuments = await Promise.all(uploadPromises);

    // Salva as referências no banco de dados
    const updatedProject = await this.projectsRepository.addDocuments(
      projectId,
      uploadedDocuments
    );

    return updatedProject;
  }
}

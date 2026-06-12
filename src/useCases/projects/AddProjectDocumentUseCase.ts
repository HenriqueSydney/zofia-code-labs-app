import { ValidationError, ResourceNotFoundError } from "@/errors";
import { handleErrors } from "@/errors/handleErrors";
import { assertClientEmployeePermission } from "@/lib/auth/assertClientEmployeePermission";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { IProjectsRepository } from "@/repositories/IProjectsRepository";
import { IS3StorageService } from "@/services/s3Client/IS3StorageService";
import { prepareFileToUpload } from "@/utils/prepareFileToUpload";

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
      throw new ValidationError("Nenhum arquivo enviado.");
    }

    // 1. Verifica se o projeto existe
    const projectExists = await this.projectsRepository.findById(projectId);
    if (!projectExists) {
      throw new ResourceNotFoundError("Projeto não encontrado.");
    }

    try {
      await assertClientEmployeePermission(
        userId,
        projectExists.clientId,
        "UPLOAD_DOCUMENT",
      );
    } catch {
      await checkUserPermissionForAsset(
        "documents",
        userId,
        projectExists,
        "UPDATE",
      );
    }

    // Utilizamos o slug para manter a estrutura de pastas organizada,
    // ou o id caso o slug não esteja disponível no objeto retornado
    const folderName = `projects/${projectExists.slug || projectId}`;

    try {
      // 3. Preparar e Validar todos os arquivos (CPU/Memória)
      // Se houver um arquivo inválido, a execução para aqui antes de iniciar uploads
      const preparedFiles = await Promise.all(
        files.map((file) => prepareFileToUpload({ file, folderName }))
      );

      // 4. Upload para o Storage em paralelo (Operação de Rede)
      const uploadedDocuments = await Promise.all(
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

      // 5. Salva as referências no banco de dados (Operação Final)
      const updatedProject = await this.projectsRepository.addDocuments(
        projectId,
        uploadedDocuments
      );

      return updatedProject;
    } catch (error) {
      handleErrors(error);
      throw error;
    }
  }
}

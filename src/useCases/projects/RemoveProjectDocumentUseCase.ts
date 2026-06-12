import { ResourceNotFoundError } from "@/errors";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { IProjectsRepository } from "@/repositories/IProjectsRepository";
import { IS3StorageService } from "@/services/s3Client/IS3StorageService";

interface RemoveDocumentRequest {
  projectId: string;
  documentId: string;
  userId: string;
}

export class RemoveProjectDocumentUseCase {
  constructor(
    private projectsRepository: IProjectsRepository,
    private storageService: IS3StorageService,
  ) {}

  async execute({
    documentId,
    userId,
    projectId,
  }: RemoveDocumentRequest): Promise<{ slug: string; clientSlug: string }> {
    const projectExists = await this.projectsRepository.findById(projectId);
    if (!projectExists) {
      throw new ResourceNotFoundError("Projeto não encontrado.");
    }

    await checkUserPermissionForAsset(
      "documents",
      userId,
      projectExists,
      "DELETE",
    );

    const deletedDocument =
      await this.projectsRepository.deleteDocument(documentId);

    if (!deletedDocument) {
      throw new ResourceNotFoundError("Documento não encontrado ou já excluído.");
    }

    const fileKey = this.extractKeyFromUrl(
      deletedDocument.documentUrlReference,
    );

    if (fileKey) {
      try {
        // 3. Remove do Storage (R2/S3)
        await this.storageService.delete(fileKey);
      } catch (error) {
        console.error(
          `Falha ao deletar arquivo físico no S3: ${fileKey}`,
          error,
        );
      }
    }

    return { slug: projectExists.slug, clientSlug: projectExists.client.slug };
  }

  // Função auxiliar para pegar o caminho relativo da URL
  private extractKeyFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname.substring(1);
    } catch (e) {
      return url;
    }
  }
}

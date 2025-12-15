import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { IProjectsRepository } from "@/repositories/IProjectsRepository";

interface ICancelProjectUseCase {
  projectId: string;
  userId: string;
}

export class CancelProjectUseCase {
  constructor(private projectsRepository: IProjectsRepository) {}

  async execute({ projectId, userId }: ICancelProjectUseCase) {
    const projectExists = await this.projectsRepository.findById(projectId);
    if (!projectExists) {
      throw new Error("Projeto não encontrado.");
    }

    await checkUserPermissionForAsset(
      "project",
      userId,
      projectExists,
      "DELETE"
    );
    // 1. Busca o projeto para pegar as URLs dos arquivos e deletar do R2
    const project = await this.projectsRepository.findById(projectId);

    if (!project) {
      throw new Error("Projeto não encontrado.");
    }

    await this.projectsRepository.cancel(projectId);
  }
}

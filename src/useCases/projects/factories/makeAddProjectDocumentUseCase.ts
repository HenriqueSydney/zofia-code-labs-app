import { makeS3StorageService } from "@/services/s3Client/makeS3StorageService";
import { makeProjectRepository } from "@/repositories/factories/makeProjectRepository";
import { AddProjectDocumentUseCase } from "../AddProjectDocumentUseCase";

// 1. Variável para armazenar a instância (Singleton)
let instance: AddProjectDocumentUseCase;

export function makeAddProjectDocumentUseCase() {
  // 2. Checa se a INSTÂNCIA já existe, não a classe
  if (!instance) {
    const projectRepository = makeProjectRepository();
    const storageService = makeS3StorageService();

    // 3. Cria a instância
    instance = new AddProjectDocumentUseCase(projectRepository, storageService);
  }

  // 4. Retorna a instância criada
  return instance;
}

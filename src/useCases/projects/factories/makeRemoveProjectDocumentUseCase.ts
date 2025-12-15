import { makeS3StorageService } from "@/services/s3Client/makeS3StorageService";
import { makeProjectRepository } from "@/repositories/factories/makeProjectRepository";
import { RemoveProjectDocumentUseCase } from "../RemoveProjectDocumentUseCase";

// 1. Variável para armazenar a instância (Singleton)
let instance: RemoveProjectDocumentUseCase;

export function makeRemoveProjectDocumentUseCase() {
  // 2. Checa se a INSTÂNCIA já existe, não a classe
  if (!instance) {
    const projectRepository = makeProjectRepository();
    const storageService = makeS3StorageService();

    // 3. Cria a instância
    instance = new RemoveProjectDocumentUseCase(
      projectRepository,
      storageService
    );
  }

  // 4. Retorna a instância criada
  return instance;
}

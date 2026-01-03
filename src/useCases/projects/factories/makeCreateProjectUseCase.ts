import { CreateProjectUseCase } from "../CreateProjectUseCase";
import { makeS3StorageService } from "@/services/s3Client/makeS3StorageService";
import { makeProjectRepository } from "@/repositories/factories/makeProjectRepository";

let createProjectUseCase: CreateProjectUseCase;

export function makeCreateProjectUseCase() {
  if (!createProjectUseCase) {
    const projectRepository = makeProjectRepository();
    const storageService = makeS3StorageService();
    createProjectUseCase = new CreateProjectUseCase(
      projectRepository,
      storageService
    );
  }

  return createProjectUseCase;
}

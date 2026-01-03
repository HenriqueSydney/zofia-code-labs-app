import { UpdateProjectUseCase } from "../UpdateProjectUseCase";
import { makeS3StorageService } from "@/services/s3Client/makeS3StorageService";
import { makeProjectRepository } from "@/repositories/factories/makeProjectRepository";

let updateProjectUseCase: UpdateProjectUseCase;

export function makeUpdateProjectUseCase() {
  if (!updateProjectUseCase) {
    const projectRepository = makeProjectRepository();
    const storageService = makeS3StorageService();
    updateProjectUseCase = new UpdateProjectUseCase(
      projectRepository,
      storageService
    );
  }

  return updateProjectUseCase;
}

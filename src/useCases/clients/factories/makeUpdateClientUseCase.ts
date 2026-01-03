import { UpdateClientUseCase } from "../UpdateClientUseCase";
import { makeClientRepository } from "@/repositories/factories/makeClientRepository";
import { makeS3StorageService } from "@/services/s3Client/makeS3StorageService";

let updateClientUseCase: UpdateClientUseCase;

export function makeUpdateClientUseCase() {
  if (!updateClientUseCase) {
    const clientRepository = makeClientRepository();
    const storageService = makeS3StorageService();
    updateClientUseCase = new UpdateClientUseCase(
      clientRepository,
      storageService
    );
  }

  return updateClientUseCase;
}

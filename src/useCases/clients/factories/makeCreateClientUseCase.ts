import { CreateClientUseCase } from "../CreateClientUseCase";
import { makeS3StorageService } from "@/services/s3Client/makeS3StorageService";
import { makeClientRepository } from "@/repositories/factories/makeClientRepository";

let createClientUseCase: CreateClientUseCase;

export function makeCreateClientUseCase() {
  if (!createClientUseCase) {
    const clientRepository = makeClientRepository();
    const storageService = makeS3StorageService();
    createClientUseCase = new CreateClientUseCase(
      clientRepository,
      storageService
    );
  }

  return createClientUseCase;
}

import { PrismaUsersRepository } from "@/repositories/prisma/PrismaUsersRepository";
import { GetUserAllInfoUseCase } from "../GetUserAllInfoUseCase";
import { makeS3StorageService } from "@/services/s3Client/makeS3StorageService";

export function makeGetUserAllInfoUseCase() {
  const usersRepository = new PrismaUsersRepository();

  const storageService = makeS3StorageService();
  const useCase = new GetUserAllInfoUseCase(usersRepository, storageService);

  return useCase;
}

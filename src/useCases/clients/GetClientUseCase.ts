import { AppError } from "@/errors/AppError";
import { Client } from "@/generated/prisma/client";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { IClientsRepository } from "@/repositories/IClientsRepository";

interface GetClientUseCaseRequest {
  slug: string;
  userId: string;
}

export class GetClientUseCase {
  constructor(private clientRepository: IClientsRepository) {}

  async execute({ slug, userId }: GetClientUseCaseRequest): Promise<{
    client: Client;
  }> {
    const client = await this.clientRepository.findBySlug(slug);

    if (!client) {
      throw new AppError("Cliente não localizado");
    }

    await checkUserPermissionForAsset("client", userId, client, "READ");

    return { client };
  }
}

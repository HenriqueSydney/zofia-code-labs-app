import { Client } from "@/generated/prisma/client";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { IClientsRepository } from "@/repositories/IClientsRepository";

interface FetchClientUseCaseRequest {
  query?: string | null;
  organizationId: string;
  userId: string;
}

export class FetchClientUseCase {
  constructor(private clientRepository: IClientsRepository) {}

  async execute({
    query,
    organizationId,
    userId,
  }: FetchClientUseCaseRequest): Promise<{
    clients: Client[];
  }> {
    const clients = await this.clientRepository.fetchClients(
      organizationId,
      query,
    );

    await checkUserPermissionForAsset(
      "client",
      userId,
      { organizationId },
      "READ",
    );

    return { clients };
  }
}

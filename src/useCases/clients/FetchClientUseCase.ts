import { Client } from "@/generated/prisma/client";
import { IClientsRepository } from "@/repositories/IClientsRepository";

interface FetchClientUseCaseRequest {
  query?: string | null;
  organizationId: string;
}

export class FetchClientUseCase {
  constructor(private clientRepository: IClientsRepository) {}

  async execute({ query, organizationId }: FetchClientUseCaseRequest): Promise<{
    clients: Client[];
  }> {
    const clients = await this.clientRepository.fetchClients(
      organizationId,
      query
    );

    return { clients };
  }
}

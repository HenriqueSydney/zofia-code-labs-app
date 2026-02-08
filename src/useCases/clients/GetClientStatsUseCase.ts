import { AppError } from "@/errors/AppError";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import {
  ClientDashboardStats,
  IClientsRepository,
} from "@/repositories/IClientsRepository";

interface GetClientStatsUseCaseRequest {
  slug: string;
  userId: string;
}

export class GetClientStatsUseCase {
  constructor(private clientRepository: IClientsRepository) {}

  async execute({ slug, userId }: GetClientStatsUseCaseRequest): Promise<{
    clientStats: ClientDashboardStats | null;
  }> {
    const [client, clientStats] = await Promise.all([
      this.clientRepository.findBySlug(slug),
      this.clientRepository.getClientStats(slug),
    ]);

    if (!client) {
      throw new AppError("Cliente não localizado");
    }

    await checkUserPermissionForAsset("client", userId, client, "READ");

    return { clientStats };
  }
}

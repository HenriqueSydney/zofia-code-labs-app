import { ResourceNotFoundError } from "@/errors";
import { assertClientAccessForUser } from "@/lib/auth/resolveClientAccess";
import { MemberRole } from "@/generated/prisma/enums";
import {
  ClientDashboardStats,
  IClientsRepository,
} from "@/repositories/IClientsRepository";

interface GetClientStatsUseCaseRequest {
  slug: string;
  userId: string;
  memberRole?: MemberRole | null;
}

export class GetClientStatsUseCase {
  constructor(private clientRepository: IClientsRepository) {}

  async execute({
    slug,
    userId,
    memberRole,
  }: GetClientStatsUseCaseRequest): Promise<{
    clientStats: ClientDashboardStats | null;
  }> {
    const [client, clientStats] = await Promise.all([
      this.clientRepository.findBySlug(slug),
      this.clientRepository.getClientStats(slug),
    ]);

    if (!client) {
      throw new ResourceNotFoundError("Cliente não localizado");
    }

    await assertClientAccessForUser({
      userId,
      memberRole,
      clientSlug: slug,
      client,
      operation: "READ",
    });

    return { clientStats };
  }
}

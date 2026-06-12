import { ResourceNotFoundError } from "@/errors";
import { assertClientAccessForUser } from "@/lib/auth/resolveClientAccess";
import { MemberRole } from "@/generated/prisma/enums";
import {
  ClientWithStats,
  IClientsRepository,
} from "@/repositories/IClientsRepository";

interface GetClientUseCaseRequest {
  slug: string;
  userId: string;
  memberRole?: MemberRole | null;
}

export class GetClientUseCase {
  constructor(private clientRepository: IClientsRepository) {}

  async execute({ slug, userId, memberRole }: GetClientUseCaseRequest): Promise<{
    client: ClientWithStats | null;
  }> {
    const client = await this.clientRepository.findBySlug(slug);

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

    return { client };
  }
}

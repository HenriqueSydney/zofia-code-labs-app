import { ResourceNotFoundError } from "@/errors";
import { assertClientAccessForUser } from "@/lib/auth/resolveClientAccess";
import { MemberRole } from "@/generated/prisma/enums";
import {
  ClientBlockerItem,
  IClientsRepository,
} from "@/repositories/IClientsRepository";

interface GetClientBlockersUseCaseRequest {
  slug: string;
  userId: string;
  memberRole?: MemberRole | null;
}

export class GetClientBlockersUseCase {
  constructor(private clientRepository: IClientsRepository) {}

  async execute({
    slug,
    userId,
    memberRole,
  }: GetClientBlockersUseCaseRequest): Promise<{
    blockerItens: ClientBlockerItem[];
  }> {
    const [client, blockerItens] = await Promise.all([
      this.clientRepository.findBySlug(slug),
      this.clientRepository.getClientBlockers(slug),
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

    return { blockerItens };
  }
}

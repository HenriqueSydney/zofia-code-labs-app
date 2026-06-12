import { ResourceNotFoundError } from "@/errors";
import { assertClientAccessForUser } from "@/lib/auth/resolveClientAccess";
import { MemberRole } from "@/generated/prisma/enums";
import { IClientsRepository } from "@/repositories/IClientsRepository";

interface DeleteClientUseCaseRequest {
  id: string;
  userId: string;
  memberRole?: MemberRole | null;
}

export class DeleteClientUseCase {
  constructor(private clientsRepository: IClientsRepository) {}

  async execute({ id, userId, memberRole }: DeleteClientUseCaseRequest) {
    const client = await this.clientsRepository.findById(id);
    if (!client) {
      throw new ResourceNotFoundError("Cliente não encontrado.");
    }

    await assertClientAccessForUser({
      userId,
      memberRole,
      clientSlug: client.slug,
      client,
      operation: "DELETE",
    });

    await this.clientsRepository.delete(id);
  }
}

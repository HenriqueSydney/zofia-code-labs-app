import { ResourceNotFoundError } from "@/errors";
import { assertClientAccessForUser } from "@/lib/auth/resolveClientAccess";
import { MemberRole } from "@/generated/prisma/enums";
import { IClientEmployeesRepository } from "@/repositories/IClientEmployeesRepository";
import { IClientsRepository } from "@/repositories/IClientsRepository";

interface ListClientEmployeeUseCaseRequest {
  authenticatedUserId: string;
  slug: string;
  memberRole?: MemberRole | null;
}

export class ListClientEmployeeUseCase {
  constructor(
    private clientEmployeesRepository: IClientEmployeesRepository,
    private clientsRepository: IClientsRepository,
  ) {}

  async execute({
    authenticatedUserId,
    slug,
    memberRole,
  }: ListClientEmployeeUseCaseRequest) {
    const client = await this.clientsRepository.findBySlug(slug);

    if (!client) throw new ResourceNotFoundError("Cliente não encontrado.");

    await assertClientAccessForUser({
      userId: authenticatedUserId,
      memberRole,
      clientSlug: slug,
      client,
      operation: "READ",
      assetType: "clientEmployee",
    });

    return await this.clientEmployeesRepository.listByClient(client.id);
  }
}

import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { IClientEmployeesRepository } from "@/repositories/IClientEmployeesRepository";
import { IClientsRepository } from "@/repositories/IClientsRepository";

export class ListClientEmployeeUseCase {
  constructor(
    private clientEmployeesRepository: IClientEmployeesRepository,
    private clientsRepository: IClientsRepository
  ) {}

  async execute(authenticatedUserId: string, slug: string) {
    const client = await this.clientsRepository.findBySlug(slug);

    if (!client) throw new Error("Cliente não encontrado.");

    await checkUserPermissionForAsset(
      "clientEmployee",
      authenticatedUserId,
      { organizationId: client.organizationId },
      "READ"
    );

    return await this.clientEmployeesRepository.listByClient(client.id);
  }
}

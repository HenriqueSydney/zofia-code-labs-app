import { AppError } from "@/errors/AppError";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { IClientsRepository } from "@/repositories/IClientsRepository";
import { IContractRepository } from "@/repositories/IContractRepository";

interface ListContractsByClientSlugParams {
  clientSlug: string;
  userId: string;
  organizationId: string;
  page?: number;
  numberPerPage?: number;
}

export class ListContractsByClientSlugUseCase {
  constructor(
    private clientRepository: IClientsRepository,
    private contractRepository: IContractRepository
  ) {}

  async execute({
    clientSlug,
    userId,
    organizationId,
    numberPerPage,
    page,
  }: ListContractsByClientSlugParams) {
    const client = await this.clientRepository.findBySlug(clientSlug);

    if (!client) {
      throw new AppError("Cliente não localizado");
    }

    await checkUserPermissionForAsset(
      "contract",
      userId,
      { organizationId },
      "READ"
    );

    return await this.contractRepository.findAllByClient(client.id, {
      numberPerPage,
      page,
    });
  }
}

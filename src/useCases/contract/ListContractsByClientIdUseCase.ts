import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { IContractRepository } from "@/repositories/IContractRepository";

interface ListContractsByClientIdUseCaseParams {
  clientId: string;
  userId: string;
  organizationId: string;
}

export class ListContractsByClientIdUseCase {
  constructor(private contractRepository: IContractRepository) {}

  async execute({
    clientId,
    userId,
    organizationId,
  }: ListContractsByClientIdUseCaseParams) {
    await checkUserPermissionForAsset(
      "contract",
      userId,
      { organizationId },
      "READ"
    );
    return await this.contractRepository.findAllByClient(clientId);
  }
}

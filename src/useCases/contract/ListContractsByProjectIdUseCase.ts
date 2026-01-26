import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { IContractRepository } from "@/repositories/IContractRepository";

interface ListContractsByProjectIdUseCaseParams {
  projectId: string;
  userId: string;
  organizationId: string;
  page?: number;
  numberPerPage?: number;
}

export class ListContractsByProjectIdUseCase {
  constructor(private contractRepository: IContractRepository) {}

  async execute({
    projectId,
    userId,
    organizationId,
    numberPerPage,
    page,
  }: ListContractsByProjectIdUseCaseParams) {
    await checkUserPermissionForAsset(
      "contract",
      userId,
      { organizationId },
      "READ",
    );

    const contracts = await this.contractRepository.getHistory(projectId, {
      numberPerPage,
      page,
    });

    return contracts;
  }
}

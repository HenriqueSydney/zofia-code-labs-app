import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { IContractRepository } from "@/repositories/IContractRepository";

interface ListContractsByProjectIdUseCaseParams {
  projectId: string;
  userId: string;
  organizationId: string;
}

export class ListContractsByProjectIdUseCase {
  constructor(private contractRepository: IContractRepository) {}

  async execute({
    projectId,
    userId,
    organizationId,
  }: ListContractsByProjectIdUseCaseParams) {
    await checkUserPermissionForAsset(
      "contract",
      userId,
      { organizationId },
      "READ"
    );
    return await this.contractRepository.getHistory(projectId);
  }
}

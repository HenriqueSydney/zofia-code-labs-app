import { AppError } from "@/errors/AppError";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { IContractRepository } from "@/repositories/IContractRepository";
import { IContractTemplateRepository } from "@/repositories/IContractTemplateRepository";
type CreateContractUseCaseParams = {
  contractId: string;
  newContent: any;
  organizationId: string;
  userId: string;
};

export class UpdateContractTemplateUseCase {
  constructor(
    private contractRepository: IContractRepository,
    private contractTemplateRepository: IContractTemplateRepository
  ) {}

  async execute(
    data: CreateContractUseCaseParams
  ): Promise<{ projectId: string }> {
    const contract = await this.contractRepository.findById(data.contractId);

    if (!contract) {
      throw new AppError("Contrato não localizada");
    }

    if (!contract.contractTemplate) {
      throw new AppError("Contrato não foi gerada pelo sistema");
    }

    await checkUserPermissionForAsset(
      "contract",
      data.userId,
      contract,
      "UPDATE"
    );

    await this.contractTemplateRepository.update(contract.contractTemplate.id, {
      contractId: contract.id,
      content: data.newContent,
    });

    return { projectId: contract.projectId };
  }
}

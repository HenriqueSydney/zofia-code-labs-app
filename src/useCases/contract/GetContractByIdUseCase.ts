import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { IContractRepository } from "@/repositories/IContractRepository";

interface IGetContractByIdUseCase {
  id: string;
  userId: string;
}

export class GetContractByIdUseCase {
  constructor(private contractRepository: IContractRepository) {}

  async execute({ id, userId }: IGetContractByIdUseCase) {
    const contract = await this.contractRepository.findById(id);

    if (!contract) {
      throw new Error("Contrato não localizado");
    }

    await checkUserPermissionForAsset(
      "contract",
      userId,
      { organizationId: contract.project.organizationId },
      "READ"
    );

    return contract;
  }
}

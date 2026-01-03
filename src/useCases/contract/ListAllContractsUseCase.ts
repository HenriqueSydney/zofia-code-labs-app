import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { IContractRepository } from "@/repositories/IContractRepository";

interface ListAllContractsFilter {
  query?: string;
}

interface ListAllContractsParams {
  filter?: ListAllContractsFilter;
  userId: string;
  organizationId: string;
  page?: number;
  numberPerPage?: number;
}

export class ListAllContractsUseCase {
  constructor(private contractRepository: IContractRepository) {}

  async execute({
    filter,
    userId,
    organizationId,
    numberPerPage,
    page,
  }: ListAllContractsParams) {
    await checkUserPermissionForAsset(
      "contract",
      userId,
      { organizationId },
      "READ"
    );

    return await this.contractRepository.list(
      { organizationId, ...filter },
      { numberPerPage, page }
    );
  }
}

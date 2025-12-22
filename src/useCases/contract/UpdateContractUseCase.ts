import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { prisma } from "@/lib/prisma";
import { IAuditLogRepository } from "@/repositories/IAuditLogRepository";
import {
  CreateContractItemDTO,
  IContractRepository,
  UpdateContractDTO,
} from "@/repositories/IContractRepository";

interface UpdateContractInput extends UpdateContractDTO {
  items?: CreateContractItemDTO[];
  userId: string;
  organizationId: string;
}

export class UpdateContractUseCase {
  constructor(
    private contractRepository: IContractRepository,
    private auditLogRepository: IAuditLogRepository
  ) {}

  async execute(id: string, data: UpdateContractInput) {
    const contract = await this.contractRepository.findById(id);
    if (!contract) throw new Error("Contrato não localizado");

    await checkUserPermissionForAsset(
      "contract",
      data.userId,
      contract,
      "UPDATE"
    );

    const result = await prisma.$transaction(async (tx) => {
      const updatedContract = await this.contractRepository.update(
        id,
        data,
        tx
      );

      await this.auditLogRepository.create(
        {
          entityType: "Project",
          entityId: contract.projectId ?? "",
          action: "CONTRACT_UPDATED",
          userId: data.userId,
          changes: {
            status: {
              from: contract.status,
              to: data.status ?? contract.status,
            },
          },
          metadata: {
            contractId: contract.id,
          },
        },
        tx
      );

      return updatedContract;
    });
    return result;
  }
}

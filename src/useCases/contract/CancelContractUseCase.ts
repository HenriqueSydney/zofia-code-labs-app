import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { prisma } from "@/lib/prisma";
import { IAuditLogRepository } from "@/repositories/IAuditLogRepository";
import { IContractRepository } from "@/repositories/IContractRepository";

interface CancelContractUseCaseParams {
  id: string;
  userId: string;
}

export class CancelContractUseCase {
  constructor(
    private contractRepository: IContractRepository,
    private auditLogRepository: IAuditLogRepository,
  ) {}

  async execute({
    id,
    userId,
  }: CancelContractUseCaseParams): Promise<{
    projectId: string;
    slug: string;
    clientSlug: string;
  }> {
    const contract = await this.contractRepository.findById(id);

    if (!contract) {
      throw new Error("Contrato não localizada");
    }

    await checkUserPermissionForAsset("contract", userId, contract, "DELETE");

    if (contract.status === "SIGNED") {
      throw new Error("Não é possível excluir um contrato assinado");
    }

    if (contract.status === "CANCELLED") {
      throw new Error("Não é possível excluir uma contrato cancelado");
    }

    await prisma.$transaction(async (tx) => {
      await this.contractRepository.cancel(id, tx);
      await this.auditLogRepository.create(
        {
          entityType: "Project",
          entityId: contract.projectId ?? "",
          action: "CONTRACT_STATUS_CHANGE",
          userId,
          changes: { status: { from: contract.status, to: "CANCELLED" } },
          metadata: {
            contractId: contract.id,
          },
        },
        tx,
      );
    });

    return {
      projectId: contract.projectId,
      slug: contract.project.slug,
      clientSlug: contract.project.client.slug,
    };
  }
}

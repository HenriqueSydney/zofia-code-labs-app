import { AppError } from "@/errors/AppError";
import { Contract } from "@/generated/prisma/client";
import { ContractStatus } from "@/generated/prisma/enums";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { prisma } from "@/lib/prisma";
import { IAuditLogRepository } from "@/repositories/IAuditLogRepository";
import { IContractRepository } from "@/repositories/IContractRepository";
import { ChangeProjectStatusUseCase } from "../projects/ChangeProjectStatusUseCase";

interface ChangeContractStatusRequest {
  contractId: string;
  newStatus: ContractStatus;
  userId: string;
  communicationChannel?: "whatsapp" | "email";
}

export class ChangeContractStatusUseCase {
  constructor(
    private contractRepository: IContractRepository,
    private chageProjectStatusUseCase: ChangeProjectStatusUseCase,
    private auditLogRepository: IAuditLogRepository
  ) {}

  async execute({
    contractId,
    newStatus,
    userId,
    communicationChannel,
  }: ChangeContractStatusRequest): Promise<Contract> {
    const contract = await this.contractRepository.findById(contractId);

    if (!contract) {
      throw new AppError("Contrato não encontrada.", 404);
    }

    if (!this.isValidTransition(contract.status, newStatus)) {
      throw new AppError(
        `Não é possível alterar o status de ${contract.status} para ${newStatus}.`,
        400
      );
    }

    await checkUserPermissionForAsset(
      "contract",
      userId,
      { contract, organizationId: contract.project.organizationId },
      "UPDATE"
    );

    const updatedContract = await prisma.$transaction(async (tx) => {
      const contract = await this.contractRepository.updateStatus(
        contractId,
        newStatus,
        tx
      );

      if (newStatus === "SENT") {
        await this.chageProjectStatusUseCase.execute(
          {
            projectId: contract.projectId,
            newStatus: "WAITING_SIGNATURE",
            data: {
              observation: "Contrato enviado ao cliente para assinatura.",
            },
            userId: userId,
          },
          tx
        );
      }

      await this.auditLogRepository.create(
        {
          entityType: "Project",
          entityId: contract.projectId ?? "",
          action: "CONTRACT_STATUS_CHANGE",
          userId,
          changes: { status: { from: contract.status, to: newStatus } },
          metadata: {
            contractId: contract.id,
          },
        },
        tx
      );
      return contract;
    });

    return updatedContract;
  }

  // Helper para validar a transição (State Machine Guard)
  private isValidTransition(
    current: ContractStatus,
    next: ContractStatus
  ): boolean {
    // Se o status for o mesmo, permite (idempotência) ou bloqueia, depende da sua preferência.
    if (current === next) return true;

    const allowedTransitions: Record<ContractStatus, ContractStatus[]> = {
      [ContractStatus.DRAFT]: [ContractStatus.REVIEW, ContractStatus.CANCELLED],
      [ContractStatus.REVIEW]: [ContractStatus.DRAFT, ContractStatus.CANCELLED],

      [ContractStatus.SENT]: [ContractStatus.CANCELLED, ContractStatus.DRAFT],
      [ContractStatus.SIGNED]: [ContractStatus.CANCELLED],
      [ContractStatus.CANCELLED]: [],
    };

    return allowedTransitions[current]?.includes(next) ?? false;
  }
}

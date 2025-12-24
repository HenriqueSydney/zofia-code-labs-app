import { AppError } from "@/errors/AppError";
import { Contract } from "@/generated/prisma/client";
import { ContractStatus } from "@/generated/prisma/enums";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { prisma } from "@/lib/prisma";
import { IAuditLogRepository } from "@/repositories/IAuditLogRepository";
import { IContractRepository } from "@/repositories/IContractRepository";
import { ChangeProjectStatusUseCase } from "../projects/ChangeProjectStatusUseCase";
import { IS3StorageService } from "@/services/s3Client/IS3StorageService";
import { IDocumentSignService } from "@/services/documenso/IDocumentSignService";

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
    private auditLogRepository: IAuditLogRepository,
    private storageService: IS3StorageService,
    private documentSignService: IDocumentSignService
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
      const updatedContract = await this.contractRepository.updateStatus(
        contractId,
        newStatus,
        tx
      );

      if (newStatus === "SENT") {
        const fileKey = updatedContract.fileKey;

        if (!fileKey) {
          throw new AppError(
            "Arquivo do contrato não existe. retorne para o início da fase e gere um novo documento"
          );
        }

        // 2. Baixar o arquivo do R2 para Buffer
        // Você precisará de um método no seu StorageService que retorne o Buffer
        const fileBuffer = await this.storageService.getFileBuffer(fileKey);

        // 3. Criar o documento no Documenso
        const documentId = await this.documentSignService.createDocument(
          fileBuffer,
          `Contrato - ${contract.project.client.tradeName}`,
          [
            {
              email: contract.project.client.email,
              name: contract.project.client.tradeName,
              role: "SIGNER",
            },
            {
              email: "henriquesydneylima@gmail.com",
              name: "Henrique Sydney Ribeiro Lima",
              role: "SIGNER",
            },
          ]
        );

        // 4. Adicionar os signatários (Cliente e talvez você/empresa)
        // await this.documentSignService.addSigners(documentId, [
        //   {
        //     email: contract.project.client.email,
        //     name: contract.project.client.tradeName,
        //     role: "SIGNER",
        //   },
        //   {
        //     email: "henriquesydneylima@gmail.com",
        //     name: "Henrique Sydney Ribeiro Lima",
        //     role: "SIGNER",
        //   },
        // ]);

        await this.documentSignService.sendForSignature(documentId);

        await tx.contract.update({
          where: { id: updatedContract.id },
          data: { externalSignId: String(documentId) },
        });

        await this.chageProjectStatusUseCase.execute(
          {
            projectId: updatedContract.projectId,
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
          entityId: updatedContract.projectId ?? "",
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
      [ContractStatus.REVIEW]: [
        ContractStatus.DRAFT,
        ContractStatus.SENT,
        ContractStatus.CANCELLED,
      ],

      [ContractStatus.SENT]: [ContractStatus.CANCELLED, ContractStatus.DRAFT],
      [ContractStatus.SIGNED]: [ContractStatus.CANCELLED],
      [ContractStatus.CANCELLED]: [],
    };

    return allowedTransitions[current]?.includes(next) ?? false;
  }
}

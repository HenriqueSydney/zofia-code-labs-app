import { AppError } from "@/errors/AppError";
import { Contract } from "@/generated/prisma/client";
import { ContractStatus } from "@/generated/prisma/enums";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { prisma } from "@/lib/prisma";
import { IAuditLogRepository } from "@/repositories/IAuditLogRepository";
import { ContractWithProjectDetails, IContractRepository } from "@/repositories/IContractRepository";
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
    private changeProjectStatusUseCase: ChangeProjectStatusUseCase,
    private auditLogRepository: IAuditLogRepository,
    private storageService: IS3StorageService,
    private documentSignService: IDocumentSignService,
  ) {}

  async execute({
    contractId,
    newStatus,
    userId,
  }: ChangeContractStatusRequest): Promise<ContractWithProjectDetails> {
    const contract = await this.contractRepository.findById(contractId);

    if (!contract) throw new AppError("Contrato não encontrado.", 404);
    if (!this.isValidTransition(contract.status, newStatus)) {
      throw new AppError(
        `Transição de ${contract.status} para ${newStatus} inválida.`,
        400,
      );
    }

    await checkUserPermissionForAsset(
      "contract",
      userId,
      {
        contract,
        organizationId: contract.project.organizationId,
      },
      "UPDATE",
    );

    let externalSignId: string | undefined;

    // --- OPERAÇÕES EXTERNAS (FORA DA TRANSAÇÃO) ---
    if (newStatus === "SENT") {
      const fileKey = contract.fileKey;
      if (!fileKey) throw new AppError("Arquivo do contrato não existe.");

      // 1. Download do arquivo
      const fileBuffer = await this.storageService.getFileBuffer(fileKey);

      // 2. Integração com Documenso (API Externa)
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
        ],
      );

      await this.documentSignService.sendForSignature(documentId);
      externalSignId = String(documentId);
    }

    // --- TRANSAÇÃO DO BANCO (APENAS ESCRITA) ---
    return await prisma.$transaction(async (tx) => {
      // 1. Atualiza o status do contrato
      const updatedContract = await this.contractRepository.updateStatus(
        contractId,
        newStatus,
        tx,
      );

      // 2. Se enviou, grava o ID externo
      if (externalSignId) {
        await tx.contract.update({
          where: { id: contractId },
          data: { externalSignId },
        });
      }

      // 3. Lógica de status do projeto
      if (newStatus === "SENT") {
        await this.changeProjectStatusUseCase.execute(
          {
            projectId: contract.projectId,
            newStatus: "WAITING_SIGNATURE",
            data: { observation: "Contrato enviado ao cliente." },
            userId,
          },
          tx,
        );
      } else if (newStatus === "SIGNED") {
        await this.changeProjectStatusUseCase.execute(
          {
            projectId: contract.projectId,
            newStatus: "WAITING_DOWN_PAYMENT",
            data: { observation: "Contrato assinado." },
            userId,
          },
          tx,
        );
      } else if (["CANCELLED", "REJECTED"].includes(newStatus)) {
        await this.changeProjectStatusUseCase.execute(
          {
            projectId: contract.projectId,
            newStatus: "PROPOSAL_GENERATED",
            data: { observation: `Contrato ${newStatus.toLowerCase()}.` },
            userId,
          },
          tx,
        );
      }

      // 4. Log de Auditoria
      await this.auditLogRepository.create(
        {
          entityType: "Project",
          entityId: contract.projectId,
          action: "CONTRACT_STATUS_CHANGE",
          userId,
          changes: { status: { from: contract.status, to: newStatus } },
          metadata: { contractId: contract.id },
        },
        tx,
      );

      return updatedContract;
    });
  }

  // Helper para validar a transição (State Machine Guard)
  private isValidTransition(
    current: ContractStatus,
    next: ContractStatus,
  ): boolean {
    // Se o status for o mesmo, permite (idempotência) ou bloqueia, depende da sua preferência.
    if (current === next) return true;

    const allowedTransitions: Record<ContractStatus, ContractStatus[]> = {
      [ContractStatus.DRAFT]: [
        ContractStatus.REVIEW,
        ContractStatus.CANCELLED,
        ContractStatus.REJECTED,
      ],
      [ContractStatus.REVIEW]: [
        ContractStatus.DRAFT,
        ContractStatus.SENT,
        ContractStatus.CANCELLED,
        ContractStatus.REJECTED,
      ],

      [ContractStatus.SENT]: [
        ContractStatus.CANCELLED,
        ContractStatus.DRAFT,
        ContractStatus.REJECTED,
      ],
      [ContractStatus.SIGNED]: [
        ContractStatus.CANCELLED,
        ContractStatus.REJECTED,
      ],
      [ContractStatus.CANCELLED]: [],
      [ContractStatus.REJECTED]: [],
    };

    return allowedTransitions[current]?.includes(next) ?? false;
  }
}

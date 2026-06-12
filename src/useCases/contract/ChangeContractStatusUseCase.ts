import {
  ResourceNotFoundError,
  BusinessRuleError,
  ValidationError,
} from "@/errors";
import { Contract } from "@/generated/prisma/client";
import { ContractStatus } from "@/generated/prisma/enums";
import { sendContractReadyEmailForContract } from "@/lib/contracts/contractReadyEmail";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { assertClientHasResponsible } from "@/lib/clients/assertClientHasResponsible";
import { prisma } from "@/lib/prisma";
import { IAuditLogRepository } from "@/repositories/IAuditLogRepository";
import {
  ContractWithProjectDetails,
  IContractRepository,
} from "@/repositories/IContractRepository";
import { ProvisionClientPortalOwnerUseCase } from "../clients/ProvisionClientPortalOwnerUseCase";
import { ChangeProjectStatusUseCase } from "../projects/ChangeProjectStatusUseCase";
import { IS3StorageService } from "@/services/s3Client/IS3StorageService";
import { IDocumentSignService } from "@/services/documenso/IDocumentSignService";

interface ChangeContractStatusRequest {
  contractId: string;
  newStatus: ContractStatus;
  userId: string;
  communicationChannel?: "whatsapp" | "email" | "none";
}

export class ChangeContractStatusUseCase {
  constructor(
    private contractRepository: IContractRepository,
    private changeProjectStatusUseCase: ChangeProjectStatusUseCase,
    private auditLogRepository: IAuditLogRepository,
    private storageService: IS3StorageService,
    private documentSignService: IDocumentSignService,
    private provisionClientPortalOwnerUseCase: ProvisionClientPortalOwnerUseCase,
  ) {}

  async execute({
    contractId,
    newStatus,
    userId,
    communicationChannel,
  }: ChangeContractStatusRequest): Promise<ContractWithProjectDetails> {
    const contract = await this.contractRepository.findById(contractId);

    if (!contract) throw new ResourceNotFoundError("Contrato não encontrado.");
    if (!this.isValidTransition(contract.status, newStatus)) {
      throw new BusinessRuleError(
        `Transição de ${contract.status} para ${newStatus} inválida.`,
        { statusCode: 400 },
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
      const client = await prisma.client.findUnique({
        where: { id: contract.project.client.id },
        include: {
          organization: { select: { name: true } },
        },
      });

      if (!client) {
        throw new ResourceNotFoundError("Cliente do contrato não encontrado.");
      }

      assertClientHasResponsible(client);

      const fileKey = contract.fileKey;
      if (!fileKey)
        throw new ValidationError("Arquivo do contrato não existe.");

      const fileBuffer = await this.storageService.getFileBuffer(fileKey);

      const orgSignerEmail =
        process.env.CONTRACT_ORG_SIGNER_EMAIL ??
        process.env.EMAIL_FROM ??
        "info@zofiacodelabs.com.br";
      const orgSignerName =
        process.env.CONTRACT_ORG_SIGNER_NAME ?? "Representante Legal";

      const documentId = await this.documentSignService.createDocument(
        fileBuffer,
        `Contrato - ${client.tradeName}`,
        [
          {
            email: client.responsibleEmail!,
            name: client.responsibleName!,
            role: "SIGNER",
          },
          {
            email: orgSignerEmail,
            name: orgSignerName,
            role: "SIGNER",
          },
        ],
      );

      await this.documentSignService.sendForSignature(documentId);
      externalSignId = String(documentId);

      try {
        await this.provisionClientPortalOwnerUseCase.execute({
          client,
          projectId: contract.projectId,
          inviterUserId: userId,
          organizationName: client.organization.name,
        });
      } catch (provisionError) {
        console.error(
          "[ChangeContractStatusUseCase] Falha ao provisionar portal do cliente:",
          provisionError,
        );

        await this.auditLogRepository.create({
          entityType: "Project",
          entityId: contract.projectId,
          action: "PORTAL_PROVISION_FAILED",
          userId,
          changes: {},
          metadata: {
            contractId: contract.id,
            error:
              provisionError instanceof Error
                ? provisionError.message
                : "unknown",
          },
        });
      }

      if (communicationChannel !== "none") {
        try {
          await sendContractReadyEmailForContract({
            id: contract.id,
            project: {
              name: contract.project.name,
              client: {
                slug: contract.project.client.slug,
                tradeName: contract.project.client.tradeName,
                companyName: client.companyName,
                email: client.email,
                responsibleEmail: client.responsibleEmail,
              },
            },
          });
        } catch (emailError) {
          console.error(
            "[ChangeContractStatusUseCase] Falha ao enviar email de contrato:",
            emailError,
          );

          await this.auditLogRepository.create({
            entityType: "Project",
            entityId: contract.projectId,
            action: "CONTRACT_EMAIL_FAILED",
            userId,
            changes: {},
            metadata: {
              contractId: contract.id,
              error:
                emailError instanceof Error ? emailError.message : "unknown",
            },
          });
        }
      }
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
        ContractStatus.SIGNED,
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

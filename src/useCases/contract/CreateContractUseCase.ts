import { ContractSource, ContractStatus } from "@/generated/prisma/enums";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { prisma } from "@/lib/prisma";
import { IAuditLogRepository } from "@/repositories/IAuditLogRepository";
import { IDocumentTemplateRepository } from "@/repositories/IDocumentTemplateRepository";
import {
  CreateContractItemDTO,
  IContractRepository,
} from "@/repositories/IContractRepository";
import { IContractTemplateRepository } from "@/repositories/IContractTemplateRepository";
import { IS3StorageService } from "@/services/s3Client/IS3StorageService";
import { IProposalRepository } from "@/repositories/IProposalRepository";
import { AppError } from "@/errors/AppError";

type CreateContractUseCaseParams = {
  projectId: string;
  templateId?: string | null;
  fileUrl?: string | null;
  createdBy: string;
  organizationId: string;
  documentTemplateId?: string;
  file?: File;
};

export class CreateContractUseCase {
  constructor(
    private contractRepository: IContractRepository,
    private contractTemplateRepository: IContractTemplateRepository,
    private documentTemplateRepository: IDocumentTemplateRepository,
    private proposalRepository: IProposalRepository,
    private storageService: IS3StorageService,
    private auditLogRepository: IAuditLogRepository
  ) {}

  async execute(data: CreateContractUseCaseParams) {
    await checkUserPermissionForAsset(
      "contract",
      data.createdBy,
      { organizationId: data.organizationId },
      "CREATE"
    );

    if (!data.file && !data.documentTemplateId) {
      throw new Error(
        "É necessário fornecer um arquivo ou selecionar um template."
      );
    }

    const lastAcceptedProposal =
      await this.proposalRepository.findLastAcceptedProposal(data.projectId);

    if (!lastAcceptedProposal) {
      throw new AppError(
        "Nenhuma proposta válida localizada para criação do contrato"
      );
    }

    let contractContent: any = null;
    let contractFileUrl: string | null = null;
    let contentType: string = "application/json"; // Default para Web Template

    // --- CENÁRIO A: Upload de Arquivo (PDF/Doc) ---
    if (data.file) {
      const folderName = `contracts/${data.organizationId}`;
      const extension = data.file.name.split(".").pop() || "pdf";
      // Nome único: timestamp-uuid-nome (ou apenas timestamp-nome)
      const key = `${folderName}/${Date.now()}-${crypto.randomUUID()}.${extension}`;

      const arrayBuffer = await data.file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Upload para o R2 usando sua classe existente
      contractFileUrl = await this.storageService.upload(
        buffer as any,
        key,
        data.file.type
      );

      contentType = data.file.type;
    } else if (data.documentTemplateId) {
      const sourceTemplate =
        await this.documentTemplateRepository.findDocumentTemplateById(
          data.documentTemplateId
        );

      if (!sourceTemplate) {
        throw new Error("Template de documento não encontrado.");
      }

      if (sourceTemplate.organizationId !== data.organizationId) {
        throw new Error("Acesso negado ao template solicitado.");
      }

      contractContent = sourceTemplate.content;
    }

    return await prisma.$transaction(async (tx) => {
      const contractData = {
        ...data,
        proposalId: lastAcceptedProposal.id,
        fileUrl: contractFileUrl,
        sourceType: data.documentTemplateId
          ? ContractSource.SYSTEM_TEMPLATE
          : ContractSource.MANUAL_UPLOAD,
      };

      const contract = await this.contractRepository.create(contractData, tx);

      if (contractContent && data.documentTemplateId) {
        await this.contractTemplateRepository.create(
          {
            documentTemplateId: data.documentTemplateId, // Pode ser null/undefined se for upload
            content: contractContent,
            isDefault: false,
            isActive: true,
            contractId: contract.id,
          },
          tx
        );
      }

      await this.auditLogRepository.create(
        {
          entityType: "Project",
          entityId: contract.projectId ?? "",
          action: "CONTRACT_GENERATED",
          userId: data.createdBy,
          changes: { status: { from: "", to: ContractStatus.DRAFT } },
          metadata: {
            contractId: contract.id,
          },
        },
        tx
      );

      return contract;
    });
  }
}

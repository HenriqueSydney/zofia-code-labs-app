import { ProposalSource, ProposalStatus } from "@/generated/prisma/enums";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { prisma } from "@/lib/prisma";
import { IAuditLogRepository } from "@/repositories/IAuditLogRepository";
import { IDocumentTemplateRepository } from "@/repositories/IDocumentTemplateRepository";
import {
  CreateProposalDTO,
  IProposalRepository,
} from "@/repositories/IProposalRepository";
import { IProposalTemplateRepository } from "@/repositories/IProposalTemplateRepository";
import { IS3StorageService } from "@/services/s3Client/IS3StorageService";
import {
  calculateItemFinalPrice,
  calculateProposalTotal,
} from "@/utils/calculateItemFinalPrice";

type CreateProposalUseCaseParams = CreateProposalDTO & {
  userId: string;
  organizationId: string;
  documentTemplateId?: string;
  file?: File;
};

export class CreateProposalUseCase {
  constructor(
    private proposalRepository: IProposalRepository,
    private proposalTemplateRepository: IProposalTemplateRepository,
    private documentTemplateRepository: IDocumentTemplateRepository,
    private storageService: IS3StorageService,
    private auditLogRepository: IAuditLogRepository
  ) {}

  async execute(data: CreateProposalUseCaseParams) {
    await checkUserPermissionForAsset(
      "proposal",
      data.userId,
      { organizationId: data.organizationId },
      "CREATE"
    );

    if (!data.file && !data.documentTemplateId) {
      throw new Error(
        "É necessário fornecer um arquivo ou selecionar um template."
      );
    }

    const processedItems = data.items.map((item) => ({
      ...item,
      finalPrice: calculateItemFinalPrice(item), // Garante que o finalPrice está certo
    }));

    const calculatedTotal = calculateProposalTotal(processedItems);

    let proposalContent: any = null;
    let proposalFileUrl: string | null = null;
    let contentType: string = "application/json"; // Default para Web Template

    // --- CENÁRIO A: Upload de Arquivo (PDF/Doc) ---
    if (data.file) {
      const folderName = `proposals/${data.organizationId}`;
      const extension = data.file.name.split(".").pop() || "pdf";
      // Nome único: timestamp-uuid-nome (ou apenas timestamp-nome)
      const key = `${folderName}/${Date.now()}-${crypto.randomUUID()}.${extension}`;

      const arrayBuffer = await data.file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Upload para o R2 usando sua classe existente
      proposalFileUrl = await this.storageService.upload(
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

      proposalContent = sourceTemplate.content;
    }

    return await prisma.$transaction(async (tx) => {
      let newProposalTemplate = null;
      if (proposalContent && data.documentTemplateId) {
        newProposalTemplate = await this.proposalTemplateRepository.create(
          {
            documentTemplateId: data.documentTemplateId, // Pode ser null/undefined se for upload
            content: proposalContent,
            isDefault: false,
            isActive: true,
          },
          tx
        );
      }

      const proposalData = {
        ...data,
        items: processedItems,
        totalValue: calculatedTotal,
        fileUrl: proposalFileUrl,
        sourceType: newProposalTemplate
          ? ProposalSource.SYSTEM_TEMPLATE
          : ProposalSource.MANUAL_UPLOAD,
        templateId: newProposalTemplate ? newProposalTemplate.id : null,
      };

      const proposal = await this.proposalRepository.create(proposalData, tx);

      await this.auditLogRepository.create(
        {
          entityType: "Project",
          entityId: proposal.generatedProjectId ?? "",
          action: "PROPOSAL_GENERATED",
          userId: data.userId,
          changes: { status: { from: "", to: ProposalStatus.DRAFT } },
          metadata: {
            proposalId: proposal.id,
          },
        },
        tx
      );

      return proposal;
    });
  }
}

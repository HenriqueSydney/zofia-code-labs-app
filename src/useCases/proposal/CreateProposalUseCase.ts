import { ProposalSource, ProposalStatus } from "@/generated/prisma/enums";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { prisma } from "@/lib/prisma";
import { IAuditLogRepository } from "@/repositories/IAuditLogRepository";
import { IDocumentTemplateRepository } from "@/repositories/IDocumentTemplateRepository";
import {
  CreateProposalDTO,
  CreateProposalItemDTO,
  IProposalRepository,
} from "@/repositories/IProposalRepository";
import { IProposalTemplateRepository } from "@/repositories/IProposalTemplateRepository";
import { IServiceTypeRepository } from "@/repositories/IServiceTypeRepository";
import { IS3StorageService } from "@/services/s3Client/IS3StorageService";
import {
  calculateItemFinalPrice,
  calculateProposalTotal,
} from "@/utils/calculateItemFinalPrice";

type CreateProposalUseCaseParams = {
  projectId: string;
  templateId?: string | null;
  fileUrl?: string | null;
  createdBy: string;
  validUntil?: Date;
  items: Omit<CreateProposalItemDTO, "totalValue" | "price" | "finalPrice">[];
  organizationId: string;
  documentTemplateId?: string | null;
  downPaymentPercentage: number
  file?: File;
};

export class CreateProposalUseCase {
  constructor(
    private proposalRepository: IProposalRepository,
    private proposalTemplateRepository: IProposalTemplateRepository,
    private documentTemplateRepository: IDocumentTemplateRepository,
    private serviceTypeRepository: IServiceTypeRepository,
    private storageService: IS3StorageService,
    private auditLogRepository: IAuditLogRepository
  ) {}

  async execute(data: CreateProposalUseCaseParams) {
    await checkUserPermissionForAsset(
      "proposal",
      data.createdBy,
      { organizationId: data.organizationId },
      "CREATE"
    );

    if (!data.file && !data.documentTemplateId) {
      throw new Error(
        "É necessário fornecer um arquivo ou selecionar um template."
      );
    }

    const serviceIds = data.items.map((item) => item.serviceTypeId);

    const services = await this.serviceTypeRepository.findManyByIds(
      serviceIds,
      data.organizationId
    );

    const itemsWithValue = data.items.map((item) => ({
      ...item,
      price:
        services.find((service) => service.id === item.serviceTypeId)
          ?.basePrice ?? 0,
    }));

    const processedItems = itemsWithValue.map((item) => ({
      ...item,
      finalPrice: calculateItemFinalPrice(item), // Garante que o finalPrice está certo
    }));

    const calculatedTotal = calculateProposalTotal(processedItems);

    let proposalContent: any = null;
    let proposalStorageKey: string | null = null;
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
      const uploadResult = await this.storageService.upload(
        buffer as any,
        key,
        data.file.type
      );
      proposalStorageKey = uploadResult.key;
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
      const proposalData = {
        ...data,
        items: processedItems,
        totalValue: calculatedTotal,
        fileStorageKey: proposalStorageKey,
        sourceType: data.documentTemplateId
          ? ProposalSource.SYSTEM_TEMPLATE
          : ProposalSource.MANUAL_UPLOAD,
        status: data.documentTemplateId ? undefined : ProposalStatus.REVIEW,
      };

      const proposal = await this.proposalRepository.create(proposalData, tx);

      if (proposalContent && data.documentTemplateId) {
        await this.proposalTemplateRepository.create(
          {
            documentTemplateId: data.documentTemplateId,
            content: proposalContent,
            isDefault: false,
            isActive: true,
            proposalId: proposal.id,
          },
          tx
        );
      }

      await this.auditLogRepository.create(
        {
          entityType: "Project",
          entityId: proposal.projectId ?? "",
          action: "PROPOSAL_GENERATED",
          userId: data.createdBy,
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

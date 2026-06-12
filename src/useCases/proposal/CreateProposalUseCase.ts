import { ValidationError } from "@/errors";
import { ProposalSource, ProposalStatus } from "@/generated/prisma/enums";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { prisma } from "@/lib/prisma";
import { IAuditLogRepository } from "@/repositories/IAuditLogRepository";
import {
  CreateProposalDTO,
  CreateProposalItemDTO,
  IProposalRepository,
} from "@/repositories/IProposalRepository";
import { IServiceTypeRepository } from "@/repositories/IServiceTypeRepository";
import { IS3StorageService } from "@/services/s3Client/IS3StorageService";
import {
  calculateItemFinalPrice,
  calculateProposalTotal,
} from "@/utils/calculateItemFinalPrice";

type CreateProposalUseCaseParams = {
  projectId: string;
  fileUrl?: string | null;
  createdBy: string;
  validUntil?: Date;
  items: Omit<CreateProposalItemDTO, "totalValue" | "price" | "finalPrice">[];
  organizationId: string;
  downPaymentPercentage: number;
  file?: File;
  paymentGatewayId?: string;
  paymentMethod?: string;
};

export class CreateProposalUseCase {
  constructor(
    private proposalRepository: IProposalRepository,
    private serviceTypeRepository: IServiceTypeRepository,
    private storageService: IS3StorageService,
    private auditLogRepository: IAuditLogRepository,
  ) {}

  async execute(data: CreateProposalUseCaseParams) {
    await checkUserPermissionForAsset(
      "proposal",
      data.createdBy,
      { organizationId: data.organizationId },
      "CREATE",
    );

    if (!data.file) {
      throw new ValidationError("É necessário fornecer um arquivo PDF da proposta.");
    }

    const serviceIds = data.items.map((item) => item.serviceTypeId);

    const services = await this.serviceTypeRepository.findManyByIds(
      serviceIds,
      data.organizationId,
    );

    const itemsWithValue = data.items.map((item) => ({
      ...item,
      price:
        services.find((service) => service.id === item.serviceTypeId)
          ?.basePrice ?? 0,
    }));

    const processedItems = itemsWithValue.map((item) => ({
      ...item,
      finalPrice: calculateItemFinalPrice(item),
    }));

    const calculatedTotal = calculateProposalTotal(processedItems);

    const folderName = `proposals/${data.organizationId}`;
    const extension = data.file.name.split(".").pop() || "pdf";
    const key = `${folderName}/${Date.now()}-${crypto.randomUUID()}.${extension}`;

    const arrayBuffer = await data.file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await this.storageService.upload(
      buffer as Buffer,
      key,
      data.file.type,
    );

    return await prisma.$transaction(async (tx) => {
      const proposalData = {
        ...data,
        items: processedItems,
        totalValue: calculatedTotal,
        fileStorageKey: uploadResult.key,
        sourceType: ProposalSource.MANUAL_UPLOAD,
        status: ProposalStatus.REVIEW,
        paymentGatewayId: data.paymentGatewayId,
        paymentMethod: data.paymentMethod,
      };

      const proposal = await this.proposalRepository.create(proposalData, tx);

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
        tx,
      );

      return proposal;
    });
  }
}

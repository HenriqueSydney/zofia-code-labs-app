import { ContractSource, ContractStatus } from "@/generated/prisma/enums";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { prisma } from "@/lib/prisma";
import { IAuditLogRepository } from "@/repositories/IAuditLogRepository";
import { IContractRepository } from "@/repositories/IContractRepository";
import { IS3StorageService } from "@/services/s3Client/IS3StorageService";
import { IProposalRepository } from "@/repositories/IProposalRepository";
import { ValidationError } from "@/errors";

type CreateContractUseCaseParams = {
  projectId: string;
  fileUrl?: string | null;
  createdBy: string;
  organizationId: string;
  file?: File;
};

export class CreateContractUseCase {
  constructor(
    private contractRepository: IContractRepository,
    private proposalRepository: IProposalRepository,
    private storageService: IS3StorageService,
    private auditLogRepository: IAuditLogRepository,
  ) {}

  async execute(data: CreateContractUseCaseParams) {
    await checkUserPermissionForAsset(
      "contract",
      data.createdBy,
      { organizationId: data.organizationId },
      "CREATE",
    );

    if (!data.file) {
      throw new ValidationError("É necessário fornecer um arquivo PDF do contrato.");
    }

    const lastAcceptedProposal =
      await this.proposalRepository.findLastAcceptedProposal(data.projectId);

    if (!lastAcceptedProposal) {
      throw new ValidationError(
        "Nenhuma proposta válida localizada para criação do contrato",
      );
    }

    const folderName = `contracts/${data.organizationId}`;
    const extension = data.file.name.split(".").pop() || "pdf";
    const key = `${folderName}/${Date.now()}-${crypto.randomUUID()}.${extension}`;

    const arrayBuffer = await data.file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await this.storageService.upload(
      buffer as Buffer,
      key,
      data.file.type,
    );

    return await prisma.$transaction(async (tx) => {
      const contractData = {
        ...data,
        proposalId: lastAcceptedProposal.id,
        fileStorageKey: result.key,
        sourceType: ContractSource.MANUAL_UPLOAD,
        status: ContractStatus.REVIEW,
      };

      const contract = await this.contractRepository.create(contractData, tx);

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
        tx,
      );

      return contract;
    });
  }
}

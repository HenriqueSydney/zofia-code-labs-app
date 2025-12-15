import { DocumentTemplate } from "@/generated/prisma/client";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { IDocumentTemplateRepository } from "@/repositories/IDocumentTemplateRepository";

interface IFetchDocumentTemplatesUseCaseParams {
  query?: string;
  organizationId: string;
  page?: number;
  numberPerPage?: number;
  userId: string;
}

export class FetchDocumentTemplatesUseCase {
  constructor(
    private documentTemplateRepository: IDocumentTemplateRepository
  ) {}

  async execute({
    organizationId,
    query,
    numberPerPage,
    page,
    userId,
  }: IFetchDocumentTemplatesUseCaseParams): Promise<{
    totalOfRegisters: number;
    documentTemplates: DocumentTemplate[];
  }> {
    await checkUserPermissionForAsset(
      "documentTemplate",
      userId,
      { organizationId: organizationId },
      "READ"
    );
    const documentTemplates =
      await this.documentTemplateRepository.fetchDocumentTemplates(
        { query, organizationId },
        { numberPerPage, page }
      );

    return documentTemplates;
  }
}

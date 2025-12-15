import { IDocumentTemplateRepository } from "@/repositories/IDocumentTemplateRepository";
import { DocumentTemplateUncheckedCreateInput } from "@/generated/prisma/models";
import { DocumentTemplate, TemplateType } from "@/generated/prisma/client";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { AppError } from "@/errors/AppError";

interface CreateDocumentTemplateUseCaseParams {
  organizationId: string;
  userId: string;
  title: string;
  content: string;
  templateType: TemplateType;
}

export class CreateDocumentTemplateUseCase {
  constructor(
    private documentTemplateRepository: IDocumentTemplateRepository
  ) {}

  async execute({
    organizationId,
    userId,
    title,
    content,
    templateType,
  }: CreateDocumentTemplateUseCaseParams): Promise<DocumentTemplate> {
    const documentTemplateExists =
      await this.documentTemplateRepository.findDocumentTemplateByTitle(
        title,
        organizationId
      );

    if (!documentTemplateExists) {
      throw new AppError("Template de documento já existe.");
    }

    await checkUserPermissionForAsset(
      "documentTemplate",
      userId,
      documentTemplateExists,
      "CREATE"
    );

    const template = await this.documentTemplateRepository.create({
      title,
      content,
      organizationId,
      type: templateType,
    });
    return template;
  }
}

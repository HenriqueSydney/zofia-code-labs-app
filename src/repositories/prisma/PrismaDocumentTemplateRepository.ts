import { Pagination } from "@/@types/Pagination";
import {
  DocumentTemplate,
  Prisma,
  TemplateType,
} from "@/generated/prisma/client";
import { DocumentTemplateUncheckedCreateInput } from "@/generated/prisma/models";
import {
  FetchDocumentTemplatesParams,
  IDocumentTemplateRepository,
} from "../IDocumentTemplateRepository";
import { prisma } from "@/lib/prisma";
import { getPaginationQuery } from "@/utils/getPaginationQuery";

export class PrismaDocumentTemplateRepository
  implements IDocumentTemplateRepository
{
  async create(
    data: DocumentTemplateUncheckedCreateInput
  ): Promise<DocumentTemplate> {
    const template = await prisma.documentTemplate.create({
      data,
    });
    return template;
  }

  async update(
    id: string,
    data: Partial<DocumentTemplateUncheckedCreateInput> // Corrigido de ProjectNote para DocumentTemplate
  ): Promise<DocumentTemplate> {
    const template = await prisma.documentTemplate.update({
      where: { id },
      data,
    });
    return template;
  }

  async delete(id: string): Promise<void> {
    await prisma.documentTemplate.delete({
      where: { id },
    });
  }

  async findDocumentTemplateById(id: string): Promise<DocumentTemplate | null> {
    const template = await prisma.documentTemplate.findUnique({
      where: { id },
    });

    if (!template) return null;
    return template;
  }

  async findDocumentTemplateByTitle(
    title: string,
    organizationId: string
  ): Promise<DocumentTemplate | null> {
    const template = await prisma.documentTemplate.findFirst({
      where: { title, organizationId },
    });

    if (!template) return null;

    return template;
  }

  async fetchDocumentTemplates(
    params: FetchDocumentTemplatesParams,
    pagination?: Pagination
  ): Promise<{
    totalOfRegisters: number;
    documentTemplates: DocumentTemplate[];
  }> {
    let where: Prisma.DocumentTemplateWhereInput = {
      organizationId: params.organizationId,
    };

    if (params && params.query) {
      const templateType: TemplateType[] = [
        "CONTRACT",
        "DELIVERY_TERM",
        "OTHER",
        "PROPOSAL",
      ];

      const templateTypesQuery = templateType.filter((type) =>
        (params.query as string).toLowerCase().includes(type.toLowerCase())
      );

      console.log(templateTypesQuery);
      where = {
        OR: [
          {
            title: { contains: params.query, mode: "insensitive" },
          },
          {
            type: { in: templateTypesQuery },
          },
        ],
        organizationId: params.organizationId,
      };
    }

    const paginationDef = pagination ? getPaginationQuery(pagination) : {};
    const [totalOfRegisters, documentTemplates] = await Promise.all([
      prisma.documentTemplate.count({ where }),
      prisma.documentTemplate.findMany({
        where,
        ...paginationDef,
      }),
    ]);

    return { totalOfRegisters, documentTemplates };
  }
}

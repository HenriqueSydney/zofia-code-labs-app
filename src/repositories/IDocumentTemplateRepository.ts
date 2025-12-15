import { Pagination } from "@/@types/Pagination";
import { DocumentTemplate, Prisma } from "@/generated/prisma/client";

export type FetchDocumentTemplatesParams = {
  query?: string | null;
  organizationId: string;
};

export interface IDocumentTemplateRepository {
  create(
    data: Prisma.DocumentTemplateUncheckedCreateInput
  ): Promise<DocumentTemplate>;
  update(
    id: string,
    data: Partial<Prisma.ProjectNoteUncheckedCreateInput>
  ): Promise<DocumentTemplate>;
  delete(id: string): Promise<void>;
  findDocumentTemplateById(id: string): Promise<DocumentTemplate | null>;
  findDocumentTemplateByTitle(
    title: string,
    organizationId: string
  ): Promise<DocumentTemplate | null>;
  fetchDocumentTemplates(
    params: FetchDocumentTemplatesParams,
    pagination?: Pagination
  ): Promise<{
    totalOfRegisters: number;
    documentTemplates: DocumentTemplate[];
  }>;
}

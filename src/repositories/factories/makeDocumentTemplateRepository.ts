import { IDocumentTemplateRepository } from "../IDocumentTemplateRepository";
import { PrismaDocumentTemplateRepository } from "../prisma/PrismaDocumentTemplateRepository";

let documentTemplateRepo: IDocumentTemplateRepository | null = null;

export function makeDocumentTemplateRepository() {
  if (!documentTemplateRepo) {
    documentTemplateRepo = new PrismaDocumentTemplateRepository();
  }
  return documentTemplateRepo;
}

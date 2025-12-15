import { makeDocumentTemplateRepository } from "@/repositories/factories/makeDocumentTemplateRepository";
import { CreateDocumentTemplateUseCase } from "../CreateDocumentTemplateUseCase";

let createDocumentTemplateUseCase: CreateDocumentTemplateUseCase;

export function makeCreateDocumentTemplateUseCase() {
  if (!createDocumentTemplateUseCase) {
    const documentTemplateRepository = makeDocumentTemplateRepository();
    createDocumentTemplateUseCase = new CreateDocumentTemplateUseCase(
      documentTemplateRepository
    );
  }

  return createDocumentTemplateUseCase;
}

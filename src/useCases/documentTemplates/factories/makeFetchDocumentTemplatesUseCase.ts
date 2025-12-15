import { makeDocumentTemplateRepository } from "@/repositories/factories/makeDocumentTemplateRepository";
import { FetchDocumentTemplatesUseCase } from "../fetchDocumentTemplatesUseCase";

let fetchDocumentTemplateUseCase: FetchDocumentTemplatesUseCase;

export function makeFetchDocumentTemplatesUseCase() {
  if (!fetchDocumentTemplateUseCase) {
    const documentTemplateRepository = makeDocumentTemplateRepository();
    fetchDocumentTemplateUseCase = new FetchDocumentTemplatesUseCase(
      documentTemplateRepository
    );
  }

  return fetchDocumentTemplateUseCase;
}

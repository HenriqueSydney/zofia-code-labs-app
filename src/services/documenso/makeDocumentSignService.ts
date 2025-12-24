import { IDocumentSignService } from "./IDocumentSignService";
import { DocumensoDocumentSign } from "./DocumensoDocumentSign";

let documentSignService: IDocumentSignService | null = null;

export function makeDocumentSignService() {
  if (!documentSignService) {
    documentSignService = new DocumensoDocumentSign();
  }
  return documentSignService;
}

import { DocumentTemplate, ProjectNote } from "@/generated/prisma/client";
import { AuthBasePermissionStrategy } from "./auth-base-strategy";
import { Operation, UserContext } from "./types";

export class AuthDocumentTemplateStrategy extends AuthBasePermissionStrategy<
  DocumentTemplate & { organizationId: string }
> {
  protected validateSpecific(
    user: UserContext,
    asset: DocumentTemplate,
    operation: Operation
  ): void {
    // Regra: Qualquer um da empresa pode editar tarefas,
    // MAS apenas o criador ou admin pode deletar.
    if (operation === "DELETE") {
      // Supondo que Task tenha creatorId
    }
  }
}

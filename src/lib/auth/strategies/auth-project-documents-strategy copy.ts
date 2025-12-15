import { ProjectNote } from "@/generated/prisma/client";
import { AuthBasePermissionStrategy } from "./auth-base-strategy";
import { Operation, UserContext } from "./types";

export class AuthProjectDocumentsStrategy extends AuthBasePermissionStrategy<
  ProjectNote & { organizationId: string }
> {
  protected validateSpecific(
    user: UserContext,
    asset: ProjectNote,
    operation: Operation
  ): void {
    // Regra: Qualquer um da empresa pode editar tarefas,
    // MAS apenas o criador ou admin pode deletar.
    if (operation === "DELETE") {
      // Supondo que Task tenha creatorId
      if (asset.userId !== user.id && user.role !== "TENANT_ADMIN") {
        throw new Error("Você só pode deletar documentos que você criou.");
      }
    }
  }
}

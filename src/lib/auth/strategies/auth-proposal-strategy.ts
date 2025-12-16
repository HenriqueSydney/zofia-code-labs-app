import { Proposal } from "@/generated/prisma/client";
import { AuthBasePermissionStrategy } from "./auth-base-strategy";
import { Operation, UserContext } from "./types";

export class AuthProposalStrategy extends AuthBasePermissionStrategy<
  Proposal & { organizationId: string }
> {
  protected validateSpecific(
    user: UserContext,
    asset: Proposal,
    operation: Operation
  ): void {
    // Regra: Qualquer um da empresa pode editar tarefas,
    // MAS apenas o criador ou admin pode deletar.
    if (operation === "DELETE") {
      // Supondo que Task tenha creatorId
    }
  }
}

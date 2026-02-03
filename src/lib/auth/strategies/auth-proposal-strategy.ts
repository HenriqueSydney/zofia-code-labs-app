import { Proposal, ProposalStatus } from "@/generated/prisma/client";
import { AuthBasePermissionStrategy } from "./auth-base-strategy";
import { Operation, UserContext } from "./types";
import { AppError } from "@/errors/AppError";
import { PERMISSIONS, PermissionString } from "@/constants/permissions";

export class AuthProposalStrategy extends AuthBasePermissionStrategy<
  Proposal & { organizationId: string }
> {
  private getRequiredPermission(operation: Operation): PermissionString {
    switch (operation) {
      case "READ":
        return PERMISSIONS.PROPOSAL.READ;

      // Criação e Edição básica requerem permissão de criar
      case "CREATE":
      case "UPDATE":
      case "DELETE":
        return PERMISSIONS.PROPOSAL.CREATE;

      // Ações Específicas de Negócio
      case "SEND" as Operation:
        return PERMISSIONS.PROPOSAL.SEND;

      case "APPROVE" as Operation:
        // Aprovar internamente (Manager) ou marcar como Aceita
        return PERMISSIONS.PROPOSAL.APPROVE;

      default:
        return PERMISSIONS.PROPOSAL.READ;
    }
  }

  protected validateSpecific(
    user: UserContext,
    asset: Proposal | null,
    operation: Operation,
  ): void {
    // -------------------------------------------------------------------------
    // ETAPA 1: Verificação de Permissão (RBAC)
    // -------------------------------------------------------------------------
    const requiredPermission = this.getRequiredPermission(operation);

    if (!user.permissions.includes(requiredPermission)) {
      throw new AppError(
        `Acesso negado. Necessária permissão: ${requiredPermission}`,
        403,
      );
    }

    if (!asset) return;

    // -------------------------------------------------------------------------
    // ETAPA 2: Regras de Ciclo de Vida (Status)
    // -------------------------------------------------------------------------

    // Status que congelam a proposta.
    // Supondo: DRAFT, SENT, ACCEPTED, REJECTED, EXPIRED
    const lockedStatuses: ProposalStatus[] = ["ACCEPTED", "REJECTED"];
    const isLocked = lockedStatuses.includes(asset.status);

    if (isLocked) {
      if (operation === "UPDATE" || operation === "DELETE") {
        throw new AppError(
          `Não é possível alterar uma proposta finalizada (${asset.status}). Crie uma nova versão/duplicata.`,
          400,
        );
      }
    }

    if (operation === "DELETE") {
      const isOwner = asset.approvedBy === user.id;
      const isManager = user.permissions.includes(PERMISSIONS.PROPOSAL.APPROVE);

      if (!isOwner && !isManager) {
        throw new AppError(
          "Você só pode excluir propostas criadas por você.",
          403,
        );
      }
    }
  }
}

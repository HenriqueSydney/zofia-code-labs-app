import { Contract, ContractStatus } from "@/generated/prisma/client";
import { AuthBasePermissionStrategy } from "./auth-base-strategy";
import { Operation, UserContext } from "./types";
import { AppError } from "@/errors/AppError";
import { PERMISSIONS, PermissionString } from "@/constants/permissions";
import { contratMapper } from "@/mappers/contractStatusBadge";
import { UserDoesNotHavePermissionError } from "@/errors/UserDoesNotHavePermissionError";

export class AuthContractStrategy extends AuthBasePermissionStrategy<
  Contract & { organizationId: string }
> {
  // 1. Mapeamento de Permissões
  private getRequiredPermission(operation: Operation): PermissionString {
    switch (operation) {
      case "READ":
        return PERMISSIONS.CONTRACT.READ;
      case "CREATE":
        return PERMISSIONS.CONTRACT.CREATE;

      case "UPDATE":
        return PERMISSIONS.CONTRACT.CREATE; // Geralmente quem cria pode editar rascunhos

      case "DELETE":
        return PERMISSIONS.CONTRACT.CREATE; // Ou uma permissão específica 'contract:delete' se preferir rigidez

      case "SIGN":
        return PERMISSIONS.CONTRACT.SIGN;

      default:
        return PERMISSIONS.CONTRACT.READ;
    }
  }

  protected validateSpecific(
    user: UserContext,
    asset: Contract | null,
    operation: Operation,
  ): void {
    // -------------------------------------------------------------------------
    // ETAPA 1: Verificação de Permissão (RBAC)
    // -------------------------------------------------------------------------
    const requiredPermission = this.getRequiredPermission(operation);

    if (!user.permissions.includes(requiredPermission)) {
      throw new UserDoesNotHavePermissionError(requiredPermission);
    }

    // Se não tem asset (CREATE), encerra aqui.
    if (!asset) return;

    // -------------------------------------------------------------------------
    // ETAPA 2: Proteção de Imutabilidade (Compliance Jurídico)
    // -------------------------------------------------------------------------

    // Status que "congelam" o contrato.
    // Verifique no seu Prisma Enum quais são os status finais.
    const lockedStatuses: ContractStatus[] = [
      "SIGNED",
      "REJECTED",
      "CANCELLED",
    ];

    const isLocked = lockedStatuses.includes(asset.status);

    // Regra: Não se altera nem deleta contrato assinado/finalizado.
    // Para corrigir, deve-se criar um aditivo ou um novo contrato.
    if (isLocked) {
      if (operation === "UPDATE") {
        throw new AppError(
          `Não é possível editar um contrato com status ${contratMapper[asset.status]}. Crie um termo aditivo.`,
          400,
        );
      }

      if (operation === "DELETE") {
        // Deletar contrato assinado é perigoso para auditoria.
        // Geralmente só permitimos 'Arquivar' (Soft Delete) ou proibimos total.
        throw new AppError(
          `Não é possível excluir um contrato assinado/vigente (${contratMapper[asset.status]}) por razões de auditoria.`,
          403,
        );
      }
    }
  }
}

import { Client } from "@/generated/prisma/client";
import { AuthBasePermissionStrategy } from "./auth-base-strategy";
import { Operation, UserContext } from "./types";
import { AppError } from "@/errors/AppError";
import { PERMISSIONS, PermissionString } from "@/constants/permissions";

export class AuthClientStrategy extends AuthBasePermissionStrategy<Client> {
  // 1. Mapeia a intenção (Operation) para a Permissão (String)
  private getRequiredPermission(operation: Operation): PermissionString {
    switch (operation) {
      case "READ":
        return PERMISSIONS.CLIENT.READ;
      case "CREATE":
        return PERMISSIONS.CLIENT.CREATE;
      case "UPDATE":
        return PERMISSIONS.CLIENT.UPDATE;
      case "DELETE":
        return PERMISSIONS.CLIENT.DELETE;
      default:
        return PERMISSIONS.CLIENT.READ;
    }
  }

  protected validateSpecific(
    user: UserContext,
    asset: Client | null, // Pode ser null no CREATE
    operation: Operation,
  ): void {
    // -------------------------------------------------------------------------
    // ETAPA 1: Verificação de Permissão Explícita
    // -------------------------------------------------------------------------
    const requiredPermission = this.getRequiredPermission(operation);

    if (!user.permissions.includes(requiredPermission)) {
      throw new AppError(
        `Acesso negado. Necessária permissão: ${requiredPermission}`,
        403,
      );
    }
  }
}

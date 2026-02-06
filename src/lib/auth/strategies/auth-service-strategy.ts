import {
  ServiceDefaultBacklogItem,
  ServiceType,
} from "@/generated/prisma/client";
import { AuthBasePermissionStrategy } from "./auth-base-strategy";
import { Operation, UserContext } from "./types";
import { AppError } from "@/errors/AppError";
import { PERMISSIONS, PermissionString } from "@/constants/permissions";
import { UserDoesNotHavePermissionError } from "@/errors/UserDoesNotHavePermissionError";

export class AuthServiceStrategy extends AuthBasePermissionStrategy<
  ServiceType | ServiceDefaultBacklogItem
> {
  private getRequiredPermission(operation: Operation): PermissionString {
    switch (operation) {
      case "READ":
        return PERMISSIONS.SERVICE_CATALOG.READ;

      // Qualquer alteração no padrão exige permissão de GERÊNCIA DE CATÁLOGO
      case "CREATE":
      case "UPDATE":
      case "DELETE":
        return PERMISSIONS.SERVICE_CATALOG.MANAGE;

      default:
        return PERMISSIONS.SERVICE_CATALOG.READ;
    }
  }

  protected validateSpecific(
    user: UserContext,
    asset: ServiceDefaultBacklogItem | ServiceType | null,
    operation: Operation,
  ): void {
    // -------------------------------------------------------------------------
    // ETAPA 1: Verificação de Permissão (RBAC)
    // -------------------------------------------------------------------------
    const requiredPermission = this.getRequiredPermission(operation);

    if (!user.permissions.includes(requiredPermission)) {
      throw new UserDoesNotHavePermissionError(requiredPermission);
    }
  }
}

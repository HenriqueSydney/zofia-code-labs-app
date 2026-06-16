import { IntegrationType } from "@/generated/prisma/client";
import { AuthBasePermissionStrategy } from "./auth-base-strategy";
import { Operation, UserContext } from "./types";
import { ForbiddenError } from "@/errors";
import { PERMISSIONS } from "@/constants/permissions";

export class AuthSaasOwnerStrategy extends AuthBasePermissionStrategy<
  IntegrationType & { organizationId: string }
> {
  validate(
    user: UserContext,
    asset: IntegrationType | null,
    operation: Operation,
  ): void {
    this.validateSpecific(user, asset, operation);
  }

  protected validateSpecific(
    user: UserContext,
    asset: IntegrationType | null,
    operation: Operation,
  ): void {
    if (
      operation === "READ" &&
      user.permissions.includes(PERMISSIONS.SETTINGS.READ_INTEGRATIONS)
    ) {
      return;
    }

    if (user.role !== "OWNER") {
      // Mensagem genérica de 403 para não expor que a rota existe
      throw new ForbiddenError(
        "Acesso negado. Apenas o administrador do sistema pode gerenciar o catálogo global.",
      );
    }
  }
}

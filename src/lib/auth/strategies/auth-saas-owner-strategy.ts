import { IntegrationType } from "@/generated/prisma/client";
import { AuthBasePermissionStrategy } from "./auth-base-strategy";
import { Operation, UserContext } from "./types";
import { AppError } from "@/errors/AppError";

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
    if (user.role !== "OWNER") {
      // Mensagem genérica de 403 para não expor que a rota existe
      throw new AppError(
        "Acesso negado. Apenas o administrador do sistema pode gerenciar o catálogo global.",
        403,
      );
    }
  }
}

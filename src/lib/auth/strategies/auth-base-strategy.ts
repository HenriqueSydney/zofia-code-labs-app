import { AppError } from "@/errors/AppError";
import { IPermissionStrategy, UserContext, Operation } from "./types";

// Exige que o Asset tenha pelo menos organizationId
interface TenantAsset {
  organizationId: string;
}

export abstract class AuthBasePermissionStrategy<T extends TenantAsset>
  implements IPermissionStrategy<T>
{
  validate(user: UserContext, asset: T, operation: Operation): void {
    // 1. Regra Global: Validação de Tenant (SaaS Isolation)
    if (user.organizationId !== asset.organizationId) {
      throw new AppError("Acesso negado: Recurso de outra organização.", 403);
    }

    // 2. Chama a validação específica da classe filha
    this.validateSpecific(user, asset, operation);
  }

  // Método abstrato que as classes filhas DEVEM implementar
  protected abstract validateSpecific(
    user: UserContext,
    asset: T,
    operation: Operation
  ): void;
}

import {
  ExpenseCategory,
  OrganizationIntegration,
} from "@/generated/prisma/client";
import { AuthBasePermissionStrategy } from "./auth-base-strategy";
import { Operation, UserContext } from "./types";
import { AppError } from "@/errors/AppError";
import { PERMISSIONS, PermissionString } from "@/constants/permissions";
import { UserDoesNotHavePermissionError } from "@/errors/UserDoesNotHavePermissionError";

// Define quais tipos esse Strategy suporta
type SettingsAsset = ExpenseCategory | OrganizationIntegration;
type SettingsContext = "EXPENSE_CATEGORY" | "INTEGRATION";

export class AuthInstanceSettingsStrategy extends AuthBasePermissionStrategy<SettingsAsset> {
  constructor(private context: SettingsContext) {
    super();
  }

  private getRequiredPermission(_: Operation): PermissionString {
    // -------------------------------------------------------------------------
    // CONTEXTO: INTEGRAÇÕES (Slack, Stripe, HubSpot, etc.)
    // -------------------------------------------------------------------------
    if (this.context === "INTEGRATION") {
      // Para integrações, geralmente ler/listar também é restrito a admins,
      // pois pode expor API Keys ou status de conexão sensíveis.
      return PERMISSIONS.SETTINGS.MANAGE_INTEGRATIONS;
    }

    // -------------------------------------------------------------------------
    // CONTEXTO: CATEGORIAS DE DESPESA (Viagem, Alimentação, Software...)
    // -------------------------------------------------------------------------
    else {
      // Estamos usando MANAGE_BILLING como proxy para configurações financeiras.
      // Se preferir, crie uma permissão PERMISSIONS.FINANCIAL.MANAGE_SETTINGS
      return PERMISSIONS.SETTINGS.MANAGE_BILLING;
    }
  }

  protected validateSpecific(
    user: UserContext,
    asset: SettingsAsset | null,
    operation: Operation,
  ): void {
    // 1. Check de Permissão (RBAC)
    const requiredPermission = this.getRequiredPermission(operation);

    if (!user.permissions.includes(requiredPermission)) {
      throw new UserDoesNotHavePermissionError(requiredPermission);
    }
  }
}

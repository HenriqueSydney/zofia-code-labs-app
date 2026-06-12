import {
  ExpenseCategory,
  OrganizationIntegration,
} from "@/generated/prisma/client";
import { AuthBasePermissionStrategy } from "./auth-base-strategy";
import { Operation, UserContext } from "./types";
import { ValidationError } from "@/errors";
import { PERMISSIONS, PermissionString } from "@/constants/permissions";
import { UserDoesNotHavePermissionError } from "@/errors/UserDoesNotHavePermissionError";

// Define quais tipos esse Strategy suporta
type SettingsAsset = ExpenseCategory | OrganizationIntegration;
type SettingsContext = "EXPENSE_CATEGORY" | "INTEGRATION";

export class AuthInstanceSettingsStrategy extends AuthBasePermissionStrategy<SettingsAsset> {
  constructor(private context: SettingsContext) {
    super();
  }

  private getRequiredPermission(operation: Operation): PermissionString {
    // -------------------------------------------------------------------------
    // CONTEXTO: INTEGRAÇÕES (Slack, Stripe, HubSpot, etc.)
    // -------------------------------------------------------------------------
    if (this.context === "INTEGRATION") {
      if (operation === "READ") {
        return PERMISSIONS.SETTINGS.READ_INTEGRATIONS;
      }
      return PERMISSIONS.SETTINGS.MANAGE_INTEGRATIONS;
    }

    // -------------------------------------------------------------------------
    // CONTEXTO: CATEGORIAS DE DESPESA (Viagem, Alimentação, Software...)
    // -------------------------------------------------------------------------
    if (this.context === "EXPENSE_CATEGORY") {
      return PERMISSIONS.SETTINGS.MANAGE_EXPENSE_CATEGORIES;
    }

    throw new ValidationError("Contexto de configuração não suportado.");
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

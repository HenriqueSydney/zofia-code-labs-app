import { BusinessRuleError } from "@/errors";
import { AuthBasePermissionStrategy } from "./auth-base-strategy";
import { Operation, UserContext } from "./types";
import { Project, ProjectStatus } from "@/generated/prisma/client";
import { PERMISSIONS, PermissionString } from "@/constants/permissions";
import { UserDoesNotHavePermissionError } from "@/errors/UserDoesNotHavePermissionError";

export class AuthProjectStrategy extends AuthBasePermissionStrategy<Project> {
  // 1. Mapeamento: Qual operação exige qual permissão?
  private getRequiredPermission(operation: Operation): PermissionString {
    switch (operation) {
      case "READ":
        return PERMISSIONS.PROJECT.READ;
      case "CREATE":
        return PERMISSIONS.PROJECT.CREATE;
      case "UPDATE":
        return PERMISSIONS.PROJECT.UPDATE;
      case "DELETE":
        return PERMISSIONS.PROJECT.DELETE;
      case "ARCHIVE":
        return PERMISSIONS.PROJECT.ARCHIVE;
      default:
        return PERMISSIONS.PROJECT.READ; // Fallback seguro
    }
  }

  protected validateSpecific(
    user: UserContext,
    asset: Project | null,
    operation: Operation,
  ): void {
    // -------------------------------------------------------------------------
    // ETAPA 1: Verificação de Permissões (RBAC)
    // -------------------------------------------------------------------------
    const requiredPermission = this.getRequiredPermission(operation);

    const isExistingProject =
      asset !== null &&
      "id" in asset &&
      typeof (asset as Project).id === "string";

    const canManageProjectContent =
      user.permissions.includes(PERMISSIONS.PROJECT.MANAGE) &&
      isExistingProject &&
      (operation === "UPDATE" || operation === "CREATE");

    if (
      !user.permissions.includes(requiredPermission) &&
      !canManageProjectContent
    ) {
      throw new UserDoesNotHavePermissionError(requiredPermission);
    }

    // -------------------------------------------------------------------------
    // ETAPA 2: Regras de Negócio & Estado (Business Rules)
    // -------------------------------------------------------------------------

    // Se não tiver asset (ex: CREATE), paramos por aqui (sucesso na permissão)
    if (!asset) return;

    // Regra: Projetos finalizados ficam "congelados" para edição
    const frozenStatuses: ProjectStatus[] = ["CANCELLED", "DELIVERED"];

    if (operation === "UPDATE" && frozenStatuses.includes(asset.status)) {
      // Exceção: Talvez um Admin possa reabrir (UPDATE) o projeto mesmo fechado?
      // Se quiser permitir isso, adicione: if (!user.permissions.includes('project:manage_locked')) ...

      throw new BusinessRuleError(`Não é possível editar um projeto com status ${asset.status}. Reabra o projeto primeiro.`, { statusCode: 400 });
    }
  }
}

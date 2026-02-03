import { AppError } from "@/errors/AppError";
import { AuthBasePermissionStrategy } from "./auth-base-strategy";
import { Operation, UserContext } from "./types";
import { BacklogItem } from "@/generated/prisma/client";
import { PERMISSIONS, PermissionString } from "@/constants/permissions";

export class AuthBacklogStrategy extends AuthBasePermissionStrategy<BacklogItem> {
  // 1. Define qual permissão básica é necessária para entrar na sala
  private getRequiredPermission(operation: Operation): PermissionString {
    switch (operation) {
      case "READ":
        return PERMISSIONS.BACKLOG.READ;
      // Para Create, Update e Delete, exigimos a permissão de gestão do backlog
      case "CREATE":
      case "UPDATE":
      case "DELETE":
        return PERMISSIONS.BACKLOG.MANAGE;
      default:
        return PERMISSIONS.BACKLOG.READ;
    }
  }

  protected validateSpecific(
    user: UserContext,
    asset: BacklogItem | null,
    operation: Operation,
  ): void {
    // -------------------------------------------------------------------------
    // ETAPA 1: Verificação de Permissão Básica (Gatekeeper)
    // -------------------------------------------------------------------------
    const requiredPermission = this.getRequiredPermission(operation);

    if (!user.permissions.includes(requiredPermission)) {
      throw new AppError(
        `Acesso negado. Necessária permissão: ${requiredPermission}`,
        403,
      );
    }

    // Se for CREATE, não temos asset para validar propriedade, então encerramos aqui.
    if (!asset) return;

    // -------------------------------------------------------------------------
    // ETAPA 2: Regras de Exclusão (Delete Policies)
    // -------------------------------------------------------------------------
    if (operation === "DELETE") {
      // Regra: "Apenas o criador ou 'Admin' pode deletar"

      // Verificação de Propriedade (Ownership)
      const isCreator = asset.assigneeId === user.id;

      // Verificação de Poder Superior ("Admin")
      // Se o usuário tem poder para deletar o PROJETO inteiro, ele pode deletar uma tarefa.
      const hasProjectSuperPower = user.permissions.includes(
        PERMISSIONS.PROJECT.DELETE,
      );

      if (!isCreator && !hasProjectSuperPower) {
        throw new AppError(
          "Apenas o criador do item ou um administrador do projeto pode excluí-lo.",
          403,
        );
      }
    }

    // -------------------------------------------------------------------------
    // ETAPA 3: Regras de Edição (Opcional)
    // -------------------------------------------------------------------------
    /* Se você quiser impedir edição de itens arquivados, por exemplo:
       if (operation === "UPDATE" && asset.status === "ARCHIVED") {
         throw new AppError("Não é possível editar itens arquivados.", 400);
       }
    */
  }
}

import { DocumentTemplate } from "@/generated/prisma/client";
import { AuthBasePermissionStrategy } from "./auth-base-strategy";
import { Operation, UserContext } from "./types";
import { AppError } from "@/errors/AppError";
import { PERMISSIONS, PermissionString } from "@/constants/permissions";
import { UserDoesNotHavePermissionError } from "@/errors/UserDoesNotHavePermissionError";

export class AuthDocumentTemplateStrategy extends AuthBasePermissionStrategy<DocumentTemplate> {
  // Como definimos apenas 'document_template:manage' nas constantes,
  // todas as operações de escrita/leitura administrativa exigem essa permissão.
  private getRequiredPermission(_: Operation): PermissionString {
    return PERMISSIONS.DOCUMENT_TEMPLATE.MANAGE;
  }

  protected validateSpecific(
    user: UserContext,
    asset: DocumentTemplate | null,
    operation: Operation,
  ): void {
    // -------------------------------------------------------------------------
    // ETAPA 1: Verificação de Permissão (Manager Only)
    // -------------------------------------------------------------------------
    const requiredPermission = this.getRequiredPermission(operation);

    if (!user.permissions.includes(requiredPermission)) {
      throw new UserDoesNotHavePermissionError(requiredPermission);
    }
    if (!asset) return;

    // -------------------------------------------------------------------------
    // ETAPA 2: Regras de Proteção de Integridade (System Defaults)
    // -------------------------------------------------------------------------

    // É comum em SaaS ter templates "Padrão do Sistema" que a gente injeta
    // para o cliente não começar do zero. Esses não devem ser excluídos.

    // Supondo que você tenha um campo isSystem ou isDefault no Schema
    const isSystemTemplate = asset.isSystem === true;

    if (isSystemTemplate) {
      if (operation === "DELETE") {
        throw new AppError(
          "Não é possível excluir modelos padrão do sistema.",
          403,
        );
      }

      if (operation === "UPDATE") {
        // Opcional: Talvez permitir editar apenas o conteúdo, mas não o nome/chave
        // Ou bloquear totalmente e obrigar o usuário a "Duplicar" o template sistema.
        throw new AppError(
          "Duplique o modelo de sistema para customizá-lo.",
          403,
        );
      }
    }
  }
}

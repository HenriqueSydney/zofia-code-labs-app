import { AppError } from "@/errors/AppError";
import { AuthBasePermissionStrategy } from "./auth-base-strategy";
import { Operation, UserContext } from "./types";
import { Project, ProjectStatus } from "@/generated/prisma/client";

export class AuthProjectStrategy extends AuthBasePermissionStrategy<Project> {
  protected validateSpecific(
    user: UserContext,
    asset: Project,
    operation: Operation
  ): void {
    // Regra: Apenas ADMIN/OWNER pode deletar ou arquivar projetos
    if (
      (operation === "DELETE" || operation === "ARCHIVE") &&
      user.role !== "TENANT_ADMIN" &&
      user.role !== "OWNER"
    ) {
      throw new AppError("Apenas administradores podem remover projetos.", 403);
    }

    const projectStatus: ProjectStatus[] = ["CANCELLED", "DELIVERED"];
    // Regra: Ninguém pode editar projetos arquivados
    if (operation === "UPDATE" && projectStatus.includes(asset.status)) {
      throw new AppError(
        `Não é possível editar um projeto com status ${asset.status}.`,
        400
      );
    }
  }
}

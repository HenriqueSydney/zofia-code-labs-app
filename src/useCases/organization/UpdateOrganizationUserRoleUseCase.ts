import { AppError } from "@/errors/AppError";

import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { Role } from "@/generated/prisma/enums";
import { IOrganizationsRepository } from "@/repositories/IOrganizationRepository";

interface UpdateOrganizationUserRoleUseCaseRequest {
  userId: string;
  memberId: string;
  organizationId: string;
  roleId: string; // Pode ser "admin", "viewer" ou um UUID
}

// Mapa de tradução para Roles Estáticas
const STATIC_ROLES_MAP: Record<string, Omit<Role, "OWNER">> = {
  admin: "TENANT_ADMIN", 
  viewer: "TENANT_OBSERVER",
  member: "TENANT_MEMBER",
};

export class UpdateOrganizationUserRoleUseCase {
  constructor(private organizationsRepository: IOrganizationsRepository) {}

  async execute({
    userId,
    memberId,
    organizationId,
    roleId,
  }: UpdateOrganizationUserRoleUseCaseRequest) {
    // 1. Buscas iniciais obrigatórias (Organização e Membro alvo)
    const [organization, member] = await Promise.all([
      this.organizationsRepository.findById(organizationId),
      this.organizationsRepository.findMemberByMemberId(
        memberId,
        organizationId,
      ),
    ]);

    // 2. Validações Básicas
    if (!organization) throw new AppError("Organização não localizada.");
    if (!member) throw new AppError("Membro não localizado.");

    // 3. Validação de Permissão (Quem está fazendo a ação pode fazer isso?)
    // await checkUserPermissionForAsset("client", userId, organization, "UPDATE");

    // 4. Lógica de Decisão: Estático vs Customizado
    const staticRoleEnum = STATIC_ROLES_MAP[roleId];

    if (staticRoleEnum) {
      // --- CAMINHO A: ROLE ESTÁTICA (Admin, Viewer) ---

      // Aqui chamamos o método que atualiza o Enum do Prisma
      await this.organizationsRepository.updateMemberRole(
        memberId,
        staticRoleEnum,
      );

      return { role: staticRoleEnum };
    } else {
      // --- CAMINHO B: CUSTOM ROLE (UUID) ---

      // Só buscamos no banco se NÃO for um role estático
      const customRole =
        await this.organizationsRepository.findCustomRoleById(roleId);

      if (!customRole) {
        throw new AppError("Perfil de acesso não encontrado.");
      }

      // Segurança de Tenant: O Role pertence a esta organização?
      if (customRole.organizationId !== organizationId) {
        throw new AppError(
          "Acesso negado: Este perfil pertence a outra organização.",
          403,
        );
      }

      // Chamamos o método que vincula o ID do cargo customizado
      await this.organizationsRepository.updateMemberCustomRole(
        memberId,
        roleId,
      );

      return { role: customRole.name };
    }
  }
}

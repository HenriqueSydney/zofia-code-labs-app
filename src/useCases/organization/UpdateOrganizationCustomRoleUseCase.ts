import { ResourceNotFoundError, ForbiddenError } from "@/errors";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { toOrganizationAsset } from "@/lib/auth/toOrganizationAsset";
import { IOrganizationsRepository } from "@/repositories/IOrganizationRepository";

interface UpdateOrganizationCustomRoleUseCaseRequest {
  userId: string;
  roleId: string;
  organizationId: string; // Importante para garantir isolamento (Tenant)
  name: string;
  description?: string;
  permissions: string[];
}

export class UpdateOrganizationCustomRoleUseCase {
  constructor(private organizationsRepository: IOrganizationsRepository) {}

  async execute({
    userId,
    roleId,
    organizationId,
    name,
    description,
    permissions,
  }: UpdateOrganizationCustomRoleUseCaseRequest) {
    // 1. Busca o Role existente
    const existingRole =
      await this.organizationsRepository.findCustomRoleById(roleId);

    if (!existingRole) {
      throw new ResourceNotFoundError("Perfil de acesso não encontrado.");
    }

    // 2. Segurança de Tenant: O Role pertence à organização informada?
    if (existingRole.organizationId !== organizationId) {
      throw new ForbiddenError("Acesso negado: Este perfil pertence a outra organização.");
    }

    // 3. Busca a Organização (para passar para o checkUserPermission)
    const organization =
      await this.organizationsRepository.findById(organizationId);

    if (!organization) throw new ResourceNotFoundError("Organização não localizada.");

    await checkUserPermissionForAsset(
      "organization",
      userId,
      toOrganizationAsset(organization),
      "UPDATE",
    );

    // 5. Atualização
    const role = await this.organizationsRepository.updateCustomRole({
      id: roleId,
      name,
      description,
      permissions,
    });

    return { role };
  }
}

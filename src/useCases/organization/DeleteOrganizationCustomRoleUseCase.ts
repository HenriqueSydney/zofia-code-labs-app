import { ResourceNotFoundError, BusinessRuleError } from "@/errors";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { toOrganizationAsset } from "@/lib/auth/toOrganizationAsset";
import { IOrganizationsRepository } from "@/repositories/IOrganizationRepository";

interface DeleteCustomRoleUseCaseRequest {
  roleId: string;
  userId: string;
}

export class DeleteOrganizationCustomRoleUseCase {
  constructor(private organizationsRepository: IOrganizationsRepository) {}

  async execute({
    roleId,
    userId,
  }: DeleteCustomRoleUseCaseRequest): Promise<void> {
    const role = await this.organizationsRepository.findCustomRoleById(roleId);

    if (!role) {
      throw new ResourceNotFoundError("Perfil de acesso não encontrado.");
    }

    await checkUserPermissionForAsset(
      "organization",
      userId,
      toOrganizationAsset({ id: role.organizationId }),
      "UPDATE",
    );

    try {
      await this.organizationsRepository.deleteCustomRole(roleId);
    } catch {
      throw new BusinessRuleError("Não é possível excluir um perfil que possui usuários vinculados.");
    }
  }
}

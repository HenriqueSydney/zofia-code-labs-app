import { AppError } from "@/errors/AppError";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { PERMISSIONS } from "@/constants/permissions";
import { IOrganizationsRepository } from "@/repositories/IOrganizationRepository";

interface CreateOrganizationCustomRoleUseCaseRequest {
  userId: string;
  organizationId: string;
  name: string;
  description?: string;
  permissions: string[];
}

export class CreateOrganizationCustomRoleUseCase {
  constructor(private organizationsRepository: IOrganizationsRepository) {}

  async execute({
    userId,
    organizationId,
    name,
    description,
    permissions,
  }: CreateOrganizationCustomRoleUseCaseRequest) {
    // 1. Busca Organização
    const organization =
      await this.organizationsRepository.findById(organizationId);

    if (!organization) {
      throw new AppError("Organização não localizada.");
    }

    // 2. Validação de Permissão
    // O usuário precisa poder gerenciar configurações/usuários para criar roles
    //await checkUserPermissionForAsset("client", userId, organization, "UPDATE");
    // Ou verifique especificamente PERMISSIONS.SETTINGS.MANAGE_USERS se sua strategy suportar

    // 3. Validação de Regra de Negócio (Opcional)
    // Ex: Verificar se já existe um role com esse nome na org

    // 4. Criação
    const role = await this.organizationsRepository.createCustomRole({
      organizationId,
      name,
      description,
      permissions,
    });

    return { role };
  }
}

import { ResourceNotFoundError } from "@/errors";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { toOrganizationAsset } from "@/lib/auth/toOrganizationAsset";
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
      throw new ResourceNotFoundError("Organização não localizada.");
    }

    await checkUserPermissionForAsset(
      "organization",
      userId,
      toOrganizationAsset(organization),
      "UPDATE",
    );

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

import { ResourceNotFoundError } from "@/errors";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { toOrganizationAsset } from "@/lib/auth/toOrganizationAsset";
import { IOrganizationsRepository } from "@/repositories/IOrganizationRepository";

interface UpdateOrganizationMemberSpecificPermissionsUseCaseRequest {
  userId: string;
  memberId: string;
  organizationId: string;
  permissions: string[];
}

export class UpdateOrganizationMemberSpecificPermissionsUseCase {
  constructor(private organizationsRepository: IOrganizationsRepository) {}

  async execute({
    userId,
    memberId,
    organizationId,
    permissions,
  }: UpdateOrganizationMemberSpecificPermissionsUseCaseRequest) {
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
    const member =
      await this.organizationsRepository.updateMemberSpecificPermissions(
        memberId,
        permissions,
      );

    return { member };
  }
}

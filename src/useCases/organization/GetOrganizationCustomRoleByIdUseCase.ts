import { ResourceNotFoundError } from "@/errors";
import { CustomRole } from "@/generated/prisma/client";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { toOrganizationAsset } from "@/lib/auth/toOrganizationAsset";
import { IOrganizationsRepository } from "@/repositories/IOrganizationRepository";

interface GetOrganizationCustomRoleByIdUseCaseRequest {
  userId: string;
  customRoleId: string;
}

interface GetOrganizationCustomRoleByIdUseCaseResponse {
  customRole: CustomRole;
}

export class GetOrganizationCustomRoleByIdUseCase {
  constructor(private organizationsRepository: IOrganizationsRepository) {}

  async execute({
    userId,
    customRoleId,
  }: GetOrganizationCustomRoleByIdUseCaseRequest): Promise<GetOrganizationCustomRoleByIdUseCaseResponse> {
    // 1. Verifica existência da organização
    const customRole =
      await this.organizationsRepository.findCustomRoleById(customRoleId);

    if (!customRole) {
      throw new ResourceNotFoundError("Perfil de Acesso não localizado.");
    }

    await checkUserPermissionForAsset(
      "organization",
      userId,
      toOrganizationAsset({ id: customRole.organizationId }),
      "READ",
    );

    return { customRole };
  }
}

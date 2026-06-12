import { ResourceNotFoundError } from "@/errors";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { toOrganizationAsset } from "@/lib/auth/toOrganizationAsset";
import {
  CustomRoleWithUsage,
  IOrganizationsRepository,
} from "@/repositories/IOrganizationRepository";

interface FetchOrganizationCustomRolesUseCaseRequest {
  organizationId: string;
  userId: string;
}

interface FetchOrganizationCustomRolesUseCaseResponse {
  roles: CustomRoleWithUsage[];
}

export class FetchOrganizationCustomRolesUseCase {
  constructor(private organizationsRepository: IOrganizationsRepository) {}

  async execute({
    organizationId,
    userId,
  }: FetchOrganizationCustomRolesUseCaseRequest): Promise<FetchOrganizationCustomRolesUseCaseResponse> {
    // 1. Verifica existência da organização
    const organization =
      await this.organizationsRepository.findById(organizationId);

    if (!organization) {
      throw new ResourceNotFoundError("Organização não localizada.");
    }

    await checkUserPermissionForAsset(
      "organization",
      userId,
      toOrganizationAsset(organization),
      "READ",
    );

    // 3. Busca os roles
    const roles =
      await this.organizationsRepository.findCustomRoles(organizationId);

    return { roles };
  }
}

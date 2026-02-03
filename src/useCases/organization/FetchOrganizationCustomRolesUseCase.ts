import { AppError } from "@/errors/AppError";
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
      throw new AppError("Organização não localizada.");
    }

    // 2. Verifica Permissão
    // Para ver roles, o usuário deve ter acesso de leitura à organização
    // ou, se quiser ser mais restrito, acesso a SETTINGS.MANAGE_ROLES (se tiver implementado)
    //await checkUserPermissionForAsset("client", userId, organization, "READ");

    // 3. Busca os roles
    const roles =
      await this.organizationsRepository.findCustomRoles(organizationId);

    return { roles };
  }
}

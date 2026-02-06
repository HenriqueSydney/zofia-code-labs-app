import { AppError } from "@/errors/AppError";
import { CustomRole } from "@/generated/prisma/client";
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
      throw new AppError("Perfil de Acesso não localizado.");
    }

    // 2. Verifica Permissão
    // Para ver roles, o usuário deve ter acesso de leitura à organização
    // ou, se quiser ser mais restrito, acesso a SETTINGS.MANAGE_ROLES (se tiver implementado)
    //await checkUserPermissionForAsset("client", userId, organization, "READ");

    return { customRole };
  }
}

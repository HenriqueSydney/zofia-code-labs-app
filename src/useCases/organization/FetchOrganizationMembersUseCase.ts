import { AppError } from "@/errors/AppError";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import {
  IOrganizationsRepository,
  OrganizationMember,
} from "@/repositories/IOrganizationRepository";

interface FetchOrganizationMembersUseCaseRequest {
  organizationId: string;
  userId: string;
}

interface FetchOrganizationMembersUseCaseResponse {
  members: OrganizationMember[];
}

export class FetchOrganizationMembersUseCase {
  constructor(private organizationsRepository: IOrganizationsRepository) {}

  async execute({
    organizationId,
    userId,
  }: FetchOrganizationMembersUseCaseRequest): Promise<FetchOrganizationMembersUseCaseResponse> {
    // 1. Verifica se a organização existe (opcional, mas bom para garantir consistência)
    const organization =
      await this.organizationsRepository.findById(organizationId);

    if (!organization) {
      throw new AppError("Organização não localizada.");
    }

    // 2. Verifica Permissão: O usuário logado pode ler dados desta organização?
    // Usamos 'organization' como asset e 'READ' como operação base.
    // Mais pra frente, você pode ter uma permissão específica 'settings:manage_users'
    //await checkUserPermissionForAsset("client", userId, organization, "READ");

    // 3. Busca os membros
    const members =
      await this.organizationsRepository.findMembers(organizationId);

    return { members };
  }
}

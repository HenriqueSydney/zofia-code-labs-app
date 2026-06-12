import { ResourceNotFoundError } from "@/errors";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { toOrganizationAsset } from "@/lib/auth/toOrganizationAsset";
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
      throw new ResourceNotFoundError("Organização não localizada.");
    }

    await checkUserPermissionForAsset(
      "organization",
      userId,
      toOrganizationAsset(organization),
      "READ",
    );

    // 3. Busca os membros
    const members =
      await this.organizationsRepository.findMembers(organizationId);

    return { members };
  }
}

import { ValidationError, ResourceNotFoundError } from "@/errors";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { toOrganizationAsset } from "@/lib/auth/toOrganizationAsset";
import {
  IOrganizationsRepository,
  OrganizationWithStats,
} from "@/repositories/IOrganizationRepository";

// Define os tipos permitidos de busca
export type OrganizationIdentifierType = "id" | "slug" | "cnpj";

interface GetOrganizationUseCaseRequest {
  identifier: string;
  identifierType: OrganizationIdentifierType;
  userId: string;
}

export class GetOrganizationUseCase {
  constructor(private organizationRepository: IOrganizationsRepository) {}

  async execute({
    identifier,
    identifierType,
    userId,
  }: GetOrganizationUseCaseRequest): Promise<{
    organization: OrganizationWithStats;
  }> {
    // 1. Strategy Pattern: Mapeia o tipo para a função do repositório
    const lookupStrategies: Record<
      OrganizationIdentifierType,
      (value: string) => Promise<OrganizationWithStats | null>
    > = {
      id: (val) => this.organizationRepository.findById(val),
      slug: (val) => this.organizationRepository.findBySlug(val),
      cnpj: (val) => this.organizationRepository.findByCnpj(val),
    };

    // 2. Executa a estratégia selecionada
    const searchMethod = lookupStrategies[identifierType];

    if (!searchMethod) {
      throw new ValidationError("Tipo de identificador inválido.");
    }

    const organization = await searchMethod(identifier);

    // 3. Validações padrão
    if (!organization) {
      throw new ResourceNotFoundError("Organização não localizada");
    }

    await checkUserPermissionForAsset(
      "organization",
      userId,
      toOrganizationAsset(organization),
      "READ",
    );

    return { organization };
  }
}

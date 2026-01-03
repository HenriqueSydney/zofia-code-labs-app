import { OrganizationIntegration, Prisma } from "@/generated/prisma/client";

export interface IOrganizationIntegrationRepository {
  create(
    data: Prisma.OrganizationIntegrationUncheckedCreateInput
  ): Promise<OrganizationIntegration>;

  findById(id: string): Promise<OrganizationIntegration | null>;

  // Busca a conexão específica de uma empresa com um tipo (ex: Zofia + Stripe)
  findByOrgAndType(
    organizationId: string,
    integrationTypeId: string
  ): Promise<OrganizationIntegration | null>;

  // Busca por slug para facilitar a lógica de negócio (ex: buscar "stripe" para a Org X)
  findByOrgAndSlug(
    organizationId: string,
    slug: string
  ): Promise<OrganizationIntegration | null>;

  listByOrganization(
    organizationId: string
  ): Promise<OrganizationIntegration[]>;

  update(
    id: string,
    data: Prisma.OrganizationIntegrationUpdateInput
  ): Promise<OrganizationIntegration>;

  // Método específico para logs de erro e health check sem afetar o restante do config
  updateHealthStatus(
    id: string,
    status: "HEALTHY" | "WARNNING" | "ERROR",
    lastError?: string
  ): Promise<void>;

  delete(id: string): Promise<void>;
}

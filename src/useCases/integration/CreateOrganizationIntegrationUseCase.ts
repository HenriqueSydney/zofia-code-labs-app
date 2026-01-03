import { OrganizationIntegration } from "@/generated/prisma/client";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { IIntegrationTypeRepository } from "@/repositories/IIntegrationTypeRepository";
import { IOrganizationIntegrationRepository } from "@/repositories/IOrganizationIntegrationRepository";

interface CreateRequest {
  organizationId: string;
  userId: string;
  integrationTypeId: string;
  secretValues: Record<string, string>; // Mapa de Chave -> Valor
}

export class CreateOrganizationIntegrationUseCase {
  constructor(
    private repository: IOrganizationIntegrationRepository,
    private typeRepository: IIntegrationTypeRepository
  ) {}

  async execute({
    organizationId,
    userId,
    integrationTypeId,
    secretValues,
  }: CreateRequest): Promise<OrganizationIntegration> {
    // 1. Verificação de permissão
    await checkUserPermissionForAsset(
      "organizationIntegration",
      userId,
      { organizationId },
      "CREATE"
    );

    // 2. Busca o Tipo de Integração para obter o fieldsSchema
    const type = await this.typeRepository.findById(integrationTypeId);
    if (!type) {
      throw new Error("Tipo de integração não encontrado no catálogo global.");
    }

    const fieldsSchema = (type.fieldsSchema as any[]) || [];

    // 3. Validação: Todos os campos definidos no schema foram enviados?
    for (const field of fieldsSchema) {
      if (!secretValues[field.key]) {
        throw new Error(`O campo '${field.label}' é obrigatório.`);
      }
    }

    // 4. Evitar duplicidade de conexão
    const alreadyConnected = await this.repository.findByOrgAndType(
      organizationId,
      integrationTypeId
    );
    if (alreadyConnected) {
      throw new Error(
        "Esta organização já possui esta integração configurada."
      );
    }

    // 5. Definir o path do Infisical (Padrão: /orgId/integrations/slug)
    const infisicalPath = `/${organizationId}/integrations/${type.slug}`;

    /**
     * 6. Gravação em Lote no Infisical
     * Para cada campo no schema, salvamos como um segredo individual no path da integração
     */
    const hints: Record<string, string> = {};

    for (const field of fieldsSchema) {
      const value = secretValues[field.key];

      // Simulação da chamada Infisical:
      // await infisicalService.createSecret(infisicalPath, field.key.toUpperCase(), value);

      // Guardamos apenas o "hint" (últimos 4 dígitos) para exibição na UI
      hints[field.key] = `***${value.slice(-4)}`;
    }

    // 7. Salvar no Prisma com o path e metadados no JSON config
    return await this.repository.create({
      organizationId,
      integrationTypeId,
      enabled: true,
      healthStatus: "HEALTHY",
      config: {
        infisical: {
          path: infisicalPath,
          env: process.env.NODE_ENV === "production" ? "prod" : "dev",
          keys: fieldsSchema.map((f) => f.key), // Lista de chaves salvas lá
        },
        metadata: {
          addedAt: new Date().toISOString(),
          hints, // Ex: { api_key: "***4f22", sender_email: "***mail" }
        },
      },
    });
  }
}

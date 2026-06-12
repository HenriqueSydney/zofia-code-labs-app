import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { IntegrationError } from "../../errors/IntegrationError";
import { InMemoryOrganizationIntegrationRepository } from "../../repositories/in-memory/InMemoryOrganizationIntegrationRepository";
import { TestIntegrationConnectionUseCase } from "./TestIntegrationConnectionUseCase";
import type { IntegrationFactory } from "../../services/IntegrationFactory";
import type { ISecretManagementService } from "../../services/secretManagement/ISecretManagementService";

vi.mock("../../lib/auth/checkUserPermissionForAsset", () => ({
  checkUserPermissionForAsset: vi.fn().mockResolvedValue(undefined),
}));

let repository: InMemoryOrganizationIntegrationRepository;
let secretManagementService: ISecretManagementService;
let integrationFactory: IntegrationFactory;
let sut: TestIntegrationConnectionUseCase;

describe("TestIntegrationConnectionUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    repository = new InMemoryOrganizationIntegrationRepository();
    secretManagementService = {
      createFolder: vi.fn(),
      upsertSecret: vi.fn(),
      getSecret: vi.fn().mockResolvedValue("secret-value"),
      deleteSecret: vi.fn(),
    };
    integrationFactory = {
      getIntegration: vi.fn().mockResolvedValue({
        healthCheck: vi.fn().mockResolvedValue({ status: "up" }),
      }),
    } as unknown as IntegrationFactory;

    sut = new TestIntegrationConnectionUseCase(
      repository,
      secretManagementService,
      integrationFactory,
    );
  });

  it("deve marcar integração como HEALTHY quando teste passa", async () => {
    const organizationId = randomUUID();
    const integrationTypeId = randomUUID();

    repository.integrationTypes.push({
      id: integrationTypeId,
      name: "GitHub",
      slug: "github",
      logo: null,
      enableByol: false,
      description: null,
      externalDocsUrl: null,
      fieldsSchema: null,
      deletedAt: null,
    });

    const integration = await repository.create({
      organizationId,
      integrationTypeId,
      enabled: true,
      enableByol: false,
      healthStatus: null,
      config: {
        infisical: {
          path: `/${organizationId}/integrations/github`,
          keys: ["token"],
        },
      },
    });

    const result = await sut.execute({
      organizationId,
      userId: randomUUID(),
      integrationId: integration.id,
    });

    expect(result.healthStatus).toBe("HEALTHY");
    expect(integrationFactory.getIntegration).toHaveBeenCalledWith(
      expect.objectContaining({
        organizationId,
        type: "github",
        providedSecrets: { token: "secret-value" },
      }),
    );
    const config = result.config as { metadata: { lastTestAt?: string } };
    expect(config.metadata.lastTestAt).toBeDefined();
  });

  it("deve marcar integração como ERROR quando health check falha", async () => {
    const organizationId = randomUUID();
    const integrationTypeId = randomUUID();

    repository.integrationTypes.push({
      id: integrationTypeId,
      name: "GitHub",
      slug: "github",
      logo: null,
      enableByol: false,
      description: null,
      externalDocsUrl: null,
      fieldsSchema: null,
      deletedAt: null,
    });

    integrationFactory = {
      getIntegration: vi.fn().mockResolvedValue({
        healthCheck: vi.fn().mockResolvedValue({ status: "down" }),
      }),
    } as unknown as IntegrationFactory;

    sut = new TestIntegrationConnectionUseCase(
      repository,
      secretManagementService,
      integrationFactory,
    );

    const integration = await repository.create({
      organizationId,
      integrationTypeId,
      enabled: true,
      enableByol: false,
      healthStatus: null,
      config: {},
    });

    const result = await sut.execute({
      organizationId,
      userId: randomUUID(),
      integrationId: integration.id,
    });

    expect(result.healthStatus).toBe("ERROR");
  });

  it("deve lançar IntegrationError quando integração não existe", async () => {
    await expect(() =>
      sut.execute({
        organizationId: randomUUID(),
        userId: randomUUID(),
        integrationId: randomUUID(),
      }),
    ).rejects.toBeInstanceOf(IntegrationError);
  });

  it("deve marcar ERROR quando factory lança exceção", async () => {
    const organizationId = randomUUID();
    const integrationTypeId = randomUUID();

    repository.integrationTypes.push({
      id: integrationTypeId,
      name: "GitHub",
      slug: "github",
      logo: null,
      enableByol: false,
      description: null,
      externalDocsUrl: null,
      fieldsSchema: null,
      deletedAt: null,
    });

    integrationFactory = {
      getIntegration: vi.fn().mockRejectedValue(new Error("timeout")),
    } as unknown as IntegrationFactory;

    sut = new TestIntegrationConnectionUseCase(
      repository,
      secretManagementService,
      integrationFactory,
    );

    const integration = await repository.create({
      organizationId,
      integrationTypeId,
      enabled: true,
      enableByol: false,
      healthStatus: null,
      config: {},
    });

    const result = await sut.execute({
      organizationId,
      userId: randomUUID(),
      integrationId: integration.id,
    });

    expect(result.healthStatus).toBe("ERROR");
    const config = result.config as { metadata: { lastError: string } };
    expect(config.metadata.lastError).toBe("timeout");
  });

  it("não deve buscar no Infisical chaves marcadas como TAG", async () => {
    const organizationId = randomUUID();
    const integrationTypeId = randomUUID();

    repository.integrationTypes.push({
      id: integrationTypeId,
      name: "Stripe",
      slug: "stripe",
      logo: null,
      enableByol: false,
      description: null,
      externalDocsUrl: null,
      fieldsSchema: [
        {
          key: "STRIPE_SECRET_KEY",
          label: "API Secret Key",
          keyType: "SECRET",
          type: "password",
          required: true,
        },
        {
          key: "TYPE",
          label: "PAYMENT_GATEWAY",
          keyType: "TAG",
          type: "text",
          required: false,
        },
      ],
      deletedAt: null,
    });

    const integration = await repository.create({
      organizationId,
      integrationTypeId,
      enabled: true,
      enableByol: false,
      healthStatus: null,
      config: {
        infisical: {
          path: `/${organizationId}/integrations/stripe`,
          keys: ["STRIPE_SECRET_KEY", "TYPE"],
        },
      },
    });

    await sut.execute({
      organizationId,
      userId: randomUUID(),
      integrationId: integration.id,
    });

    expect(secretManagementService.getSecret).toHaveBeenCalledTimes(1);
    expect(secretManagementService.getSecret).toHaveBeenCalledWith(
      "STRIPE_SECRET_KEY",
      expect.objectContaining({
        path: `/${organizationId}/integrations/stripe`,
      }),
    );
    expect(integrationFactory.getIntegration).toHaveBeenCalledWith(
      expect.objectContaining({
        providedSecrets: { STRIPE_SECRET_KEY: "secret-value" },
      }),
    );
  });

  it("deve testar conexão sem buscar segredos quando config não tem path", async () => {
    const organizationId = randomUUID();
    const integrationTypeId = randomUUID();

    repository.integrationTypes.push({
      id: integrationTypeId,
      name: "Resend",
      slug: "resend",
      logo: null,
      enableByol: false,
      description: null,
      externalDocsUrl: null,
      fieldsSchema: null,
      deletedAt: null,
    });

    const integration = await repository.create({
      organizationId,
      integrationTypeId,
      enabled: true,
      enableByol: false,
      healthStatus: null,
      config: { metadata: {} },
    });

    const result = await sut.execute({
      organizationId,
      userId: randomUUID(),
      integrationId: integration.id,
    });

    expect(result.healthStatus).toBe("HEALTHY");
    expect(secretManagementService.getSecret).not.toHaveBeenCalled();
  });
});

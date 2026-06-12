import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { IntegrationError } from "../../errors/IntegrationError";
import { ValidationError } from "../../errors/ValidationError";
import { InMemoryIntegrationTypeRepository } from "../../repositories/in-memory/InMemoryIntegrationTypeRepository";
import { InMemoryOrganizationIntegrationRepository } from "../../repositories/in-memory/InMemoryOrganizationIntegrationRepository";
import { UpdateOrganizationIntegrationUseCase } from "./UpdateOrganizationIntegrationUseCase";

vi.mock("../../lib/auth/checkUserPermissionForAsset", () => ({
  checkUserPermissionForAsset: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/services/secretManagement/makeSecretManagementService", () => ({
  makeSecretManagementService: vi.fn(() => ({
    createFolder: vi.fn().mockResolvedValue(undefined),
    upsertSecret: vi.fn().mockResolvedValue(undefined),
  })),
}));

let organizationIntegrationRepository: InMemoryOrganizationIntegrationRepository;
let integrationTypeRepository: InMemoryIntegrationTypeRepository;
let sut: UpdateOrganizationIntegrationUseCase;

describe("UpdateOrganizationIntegrationUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    organizationIntegrationRepository =
      new InMemoryOrganizationIntegrationRepository();
    integrationTypeRepository = new InMemoryIntegrationTypeRepository();
    sut = new UpdateOrganizationIntegrationUseCase(
      organizationIntegrationRepository,
      integrationTypeRepository,
    );
  });

  it("deve desabilitar integração existente", async () => {
    const type = await integrationTypeRepository.create({
      name: "Resend",
      slug: "resend",
      enableByol: false,
    });

    const integration = await organizationIntegrationRepository.create({
      organizationId: randomUUID(),
      integrationTypeId: type.id,
      enabled: true,
      enableByol: false,
      healthStatus: "HEALTHY",
      config: { metadata: { hints: {} } },
    });

    const result = await sut.execute({
      id: integration.id,
      userId: randomUUID(),
      enabled: false,
    });

    expect(result.enabled).toBe(false);
  });

  it("deve lançar IntegrationError quando integração não existe", async () => {
    await expect(() =>
      sut.execute({
        id: randomUUID(),
        userId: randomUUID(),
        enabled: false,
      }),
    ).rejects.toBeInstanceOf(IntegrationError);
  });

  it("deve exigir campos ao migrar para BYOL", async () => {
    const type = await integrationTypeRepository.create({
      name: "Resend",
      slug: "resend",
      enableByol: true,
      fieldsSchema: [{ key: "apiKey", label: "API Key" }],
    });

    const integration = await organizationIntegrationRepository.create({
      organizationId: randomUUID(),
      integrationTypeId: type.id,
      enabled: true,
      enableByol: false,
      healthStatus: "HEALTHY",
      config: { metadata: { hints: {} } },
    });

    await expect(() =>
      sut.execute({
        id: integration.id,
        userId: randomUUID(),
        enableByol: true,
        secretValues: {},
      }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it("deve atualizar segredos em integração BYOL existente", async () => {
    const organizationId = randomUUID();
    const type = await integrationTypeRepository.create({
      name: "Resend",
      slug: "resend",
      enableByol: true,
      fieldsSchema: [{ key: "apiKey", label: "API Key" }],
    });

    const integration = await organizationIntegrationRepository.create({
      organizationId,
      integrationTypeId: type.id,
      enabled: true,
      enableByol: true,
      healthStatus: "HEALTHY",
      config: {
        infisical: { path: `/${organizationId}/integrations/resend`, keys: ["apiKey"] },
        metadata: { hints: {} },
      },
    });

    const result = await sut.execute({
      id: integration.id,
      userId: randomUUID(),
      secretValues: { apiKey: "re_nova_chave_99" },
    });

    const config = result.config as {
      metadata: { hints: Record<string, string> };
    };
    expect(config.metadata.hints.apiKey).toBe("***e_99");
  });

  it("deve usar metadata de instância gerenciada quando BYOL estiver desativado", async () => {
    const organizationId = randomUUID();
    const type = await integrationTypeRepository.create({
      name: "Resend",
      slug: "resend",
      enableByol: true,
      fieldsSchema: [{ key: "apiKey", label: "API Key" }],
    });

    const integration = await organizationIntegrationRepository.create({
      organizationId,
      integrationTypeId: type.id,
      enabled: true,
      enableByol: false,
      healthStatus: "HEALTHY",
      config: { metadata: { hints: { apiKey: "***1234" } } },
    });

    const result = await sut.execute({
      id: integration.id,
      userId: randomUUID(),
      enableByol: false,
    });

    const config = result.config as { metadata: { hints: Record<string, string> } };
    expect(config.metadata.hints.info).toBe(
      "Utilizando instância gerenciada Zofia Code Labs",
    );
  });

  it("deve usar hint curto quando segredo tiver até 4 caracteres", async () => {
    const organizationId = randomUUID();
    const type = await integrationTypeRepository.create({
      name: "Resend",
      slug: "resend",
      enableByol: true,
      fieldsSchema: [{ key: "apiKey", label: "API Key" }],
    });

    const integration = await organizationIntegrationRepository.create({
      organizationId,
      integrationTypeId: type.id,
      enabled: true,
      enableByol: true,
      healthStatus: "HEALTHY",
      config: {
        infisical: { path: `/${organizationId}/integrations/resend`, keys: ["apiKey"] },
        metadata: { hints: {} },
      },
    });

    const result = await sut.execute({
      id: integration.id,
      userId: randomUUID(),
      secretValues: { apiKey: "abc" },
    });

    const config = result.config as { metadata: { hints: Record<string, string> } };
    expect(config.metadata.hints.apiKey).toBe("***");
  });

  it("deve lançar IntegrationError quando tipo de integração não existe", async () => {
    const organizationId = randomUUID();
    const integration = await organizationIntegrationRepository.create({
      organizationId,
      integrationTypeId: randomUUID(),
      enabled: true,
      enableByol: false,
      healthStatus: "HEALTHY",
      config: {},
    });

    await expect(() =>
      sut.execute({ id: integration.id, userId: randomUUID() }),
    ).rejects.toMatchObject({ name: "IntegrationError" });
  });
});

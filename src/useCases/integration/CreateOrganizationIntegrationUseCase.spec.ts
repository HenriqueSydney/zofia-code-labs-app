import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { IntegrationError } from "../../errors/IntegrationError";
import { ValidationError } from "../../errors/ValidationError";
import { InMemoryIntegrationTypeRepository } from "../../repositories/in-memory/InMemoryIntegrationTypeRepository";
import { InMemoryOrganizationIntegrationRepository } from "../../repositories/in-memory/InMemoryOrganizationIntegrationRepository";
import { CreateOrganizationIntegrationUseCase } from "./CreateOrganizationIntegrationUseCase";

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
let sut: CreateOrganizationIntegrationUseCase;

describe("CreateOrganizationIntegrationUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    organizationIntegrationRepository =
      new InMemoryOrganizationIntegrationRepository();
    integrationTypeRepository = new InMemoryIntegrationTypeRepository();
    sut = new CreateOrganizationIntegrationUseCase(
      organizationIntegrationRepository,
      integrationTypeRepository,
    );
  });

  it("deve criar integração em modo gerenciado", async () => {
    const organizationId = randomUUID();
    const type = await integrationTypeRepository.create({
      name: "Resend",
      slug: "resend",
      enableByol: true,
      fieldsSchema: [{ key: "apiKey", label: "API Key" }],
    });

    const result = await sut.execute({
      organizationId,
      userId: randomUUID(),
      integrationTypeId: type.id,
      secretValues: {},
      enableByol: false,
    });

    expect(result.enabled).toBe(true);
    expect(result.enableByol).toBe(false);
    expect(organizationIntegrationRepository.items).toHaveLength(1);
  });

  it("não deve criar integração duplicada", async () => {
    const organizationId = randomUUID();
    const type = await integrationTypeRepository.create({
      name: "Resend",
      slug: "resend",
      enableByol: false,
    });

    const payload = {
      organizationId,
      userId: randomUUID(),
      integrationTypeId: type.id,
      secretValues: {},
      enableByol: false,
    };

    await sut.execute(payload);

    await expect(() => sut.execute(payload)).rejects.toBeInstanceOf(
      ValidationError,
    );
  });

  it("deve lançar IntegrationError quando tipo não existe", async () => {
    await expect(() =>
      sut.execute({
        organizationId: randomUUID(),
        userId: randomUUID(),
        integrationTypeId: randomUUID(),
        secretValues: {},
        enableByol: false,
      }),
    ).rejects.toBeInstanceOf(IntegrationError);
  });

  it("deve exigir campos obrigatórios em modo BYOL", async () => {
    const type = await integrationTypeRepository.create({
      name: "GitHub",
      slug: "github",
      enableByol: true,
      fieldsSchema: [{ key: "token", label: "Token de acesso" }],
    });

    await expect(() =>
      sut.execute({
        organizationId: randomUUID(),
        userId: randomUUID(),
        integrationTypeId: type.id,
        secretValues: {},
        enableByol: true,
      }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it("deve gravar segredos e hints em modo BYOL", async () => {
    const organizationId = randomUUID();
    const type = await integrationTypeRepository.create({
      name: "Resend",
      slug: "resend",
      enableByol: true,
      fieldsSchema: [{ key: "apiKey", label: "API Key" }],
    });

    const result = await sut.execute({
      organizationId,
      userId: randomUUID(),
      integrationTypeId: type.id,
      secretValues: { apiKey: "re_1234567890" },
      enableByol: true,
    });

    expect(result.enableByol).toBe(true);
    const config = result.config as {
      metadata: { hints: Record<string, string> };
    };
    expect(config.metadata.hints.apiKey).toBe("***7890");
  });

  it("deve usar hint mascarado curto para segredos com até 4 caracteres", async () => {
    const organizationId = randomUUID();
    const type = await integrationTypeRepository.create({
      name: "Resend",
      slug: "resend",
      enableByol: true,
      fieldsSchema: [{ key: "pin", label: "PIN" }],
    });

    const result = await sut.execute({
      organizationId,
      userId: randomUUID(),
      integrationTypeId: type.id,
      secretValues: { pin: "1234" },
      enableByol: true,
    });

    const config = result.config as {
      metadata: { hints: Record<string, string> };
    };
    expect(config.metadata.hints.pin).toBe("***");
  });
});

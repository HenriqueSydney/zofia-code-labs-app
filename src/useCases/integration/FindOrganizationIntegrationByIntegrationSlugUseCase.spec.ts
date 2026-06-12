import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { InMemoryOrganizationIntegrationRepository } from "../../repositories/in-memory/InMemoryOrganizationIntegrationRepository";
import { FindOrganizationIntegrationByIntegrationSlugUseCase } from "./FindOrganizationIntegrationByIntegrationSlugUseCase";

vi.mock("../../lib/auth/checkUserPermissionForAsset", () => ({
  checkUserPermissionForAsset: vi.fn().mockResolvedValue(undefined),
}));

let repository: InMemoryOrganizationIntegrationRepository;
let sut: FindOrganizationIntegrationByIntegrationSlugUseCase;

describe("FindOrganizationIntegrationByIntegrationSlugUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    repository = new InMemoryOrganizationIntegrationRepository();
    sut = new FindOrganizationIntegrationByIntegrationSlugUseCase(repository);
  });

  it("deve retornar integração quando slug existe", async () => {
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

    await repository.create({
      organizationId,
      integrationTypeId,
      enabled: true,
      enableByol: false,
      healthStatus: "HEALTHY",
      config: {},
    });

    const result = await sut.execute(organizationId, randomUUID(), "github");

    expect(result).not.toBeNull();
    expect(result?.integrationType.slug).toBe("github");
  });

  it("deve retornar null quando slug não existe", async () => {
    const result = await sut.execute(
      randomUUID(),
      randomUUID(),
      "inexistente",
    );

    expect(result).toBeNull();
  });
});

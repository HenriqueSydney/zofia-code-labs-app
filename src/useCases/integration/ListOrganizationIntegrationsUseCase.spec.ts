import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { InMemoryOrganizationIntegrationRepository } from "../../repositories/in-memory/InMemoryOrganizationIntegrationRepository";
import { ListOrganizationIntegrationsUseCase } from "./ListOrganizationIntegrationsUseCase";

vi.mock("../../lib/auth/checkUserPermissionForAsset", () => ({
  checkUserPermissionForAsset: vi.fn().mockResolvedValue(undefined),
}));

let repository: InMemoryOrganizationIntegrationRepository;
let sut: ListOrganizationIntegrationsUseCase;

describe("ListOrganizationIntegrationsUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    repository = new InMemoryOrganizationIntegrationRepository();
    sut = new ListOrganizationIntegrationsUseCase(repository);
  });

  it("deve listar integrações da organização", async () => {
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

    const result = await sut.execute(organizationId, randomUUID());

    expect(result).toHaveLength(1);
    expect(result[0].organizationId).toBe(organizationId);
  });
});

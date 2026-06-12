import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { IntegrationError } from "../../errors/IntegrationError";
import { InMemoryOrganizationIntegrationRepository } from "../../repositories/in-memory/InMemoryOrganizationIntegrationRepository";
import { DeleteOrganizationIntegrationUseCase } from "./DeleteOrganizationIntegrationUseCase";

vi.mock("../../lib/auth/checkUserPermissionForAsset", () => ({
  checkUserPermissionForAsset: vi.fn().mockResolvedValue(undefined),
}));

let repository: InMemoryOrganizationIntegrationRepository;
let sut: DeleteOrganizationIntegrationUseCase;

describe("DeleteOrganizationIntegrationUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    repository = new InMemoryOrganizationIntegrationRepository();
    sut = new DeleteOrganizationIntegrationUseCase(repository);
  });

  it("deve remover integração existente", async () => {
    const integration = await repository.create({
      organizationId: randomUUID(),
      integrationTypeId: randomUUID(),
      enabled: true,
      enableByol: false,
      healthStatus: "HEALTHY",
      config: { infisical: { path: "/org/integrations/github" } },
    });

    await sut.execute(integration.id, randomUUID());

    expect(repository.items).toHaveLength(0);
  });

  it("deve lançar IntegrationError quando integração não existe", async () => {
    await expect(() =>
      sut.execute(randomUUID(), randomUUID()),
    ).rejects.toBeInstanceOf(IntegrationError);
  });
});

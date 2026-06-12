import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { IntegrationError } from "../../errors/IntegrationError";
import { InMemoryIntegrationTypeRepository } from "../../repositories/in-memory/InMemoryIntegrationTypeRepository";
import { DeleteIntegrationTypeUseCase } from "./DeleteIntegrationTypeUseCase";

vi.mock("../../lib/auth/checkUserPermissionForAsset", () => ({
  checkUserPermissionForAsset: vi.fn().mockResolvedValue(undefined),
}));

let integrationTypeRepository: InMemoryIntegrationTypeRepository;
let sut: DeleteIntegrationTypeUseCase;

describe("DeleteIntegrationTypeUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    integrationTypeRepository = new InMemoryIntegrationTypeRepository();
    sut = new DeleteIntegrationTypeUseCase(integrationTypeRepository);
  });

  it("deve remover tipo de integração existente", async () => {
    const userId = randomUUID();
    const organizationId = randomUUID();

    const integrationType = await integrationTypeRepository.create({
      name: "GitHub",
      slug: "github",
    });

    await sut.execute(integrationType.id, userId, organizationId);

    expect(integrationTypeRepository.items[0].deletedAt).not.toBeNull();
  });

  it("não deve remover tipo de integração inexistente", async () => {
    const userId = randomUUID();
    const organizationId = randomUUID();

    await expect(() =>
      sut.execute(randomUUID(), userId, organizationId),
    ).rejects.toBeInstanceOf(IntegrationError);
  });
});

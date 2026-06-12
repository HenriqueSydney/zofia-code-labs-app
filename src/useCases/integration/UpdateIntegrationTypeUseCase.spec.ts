import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { IntegrationError } from "../../errors/IntegrationError";
import { InMemoryIntegrationTypeRepository } from "../../repositories/in-memory/InMemoryIntegrationTypeRepository";
import { UpdateIntegrationTypeUseCase } from "./UpdateIntegrationTypeUseCase";

vi.mock("../../lib/auth/checkUserPermissionForAsset", () => ({
  checkUserPermissionForAsset: vi.fn().mockResolvedValue(undefined),
}));

let repository: InMemoryIntegrationTypeRepository;
let sut: UpdateIntegrationTypeUseCase;

describe("UpdateIntegrationTypeUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    repository = new InMemoryIntegrationTypeRepository();
    sut = new UpdateIntegrationTypeUseCase(repository);
  });

  it("deve atualizar tipo de integração existente", async () => {
    const created = await repository.create({
      name: "Umami",
      slug: "umami",
      description: "Analytics",
    });

    const updated = await sut.execute({
      id: created.id,
      userId: randomUUID(),
      organizationId: randomUUID(),
      description: "Web analytics",
    });

    expect(updated.description).toBe("Web analytics");
  });

  it("não deve atualizar tipo inexistente", async () => {
    await expect(() =>
      sut.execute({
        id: randomUUID(),
        userId: randomUUID(),
        organizationId: randomUUID(),
        description: "X",
      }),
    ).rejects.toBeInstanceOf(IntegrationError);
  });
});

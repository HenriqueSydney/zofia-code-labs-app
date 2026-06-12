import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { InMemoryIntegrationTypeRepository } from "../../repositories/in-memory/InMemoryIntegrationTypeRepository";
import { FindIntegrationTypeBySlugUseCase } from "./FindIntegrationTypeBySlugUseCase";

vi.mock("../../lib/auth/checkUserPermissionForAsset", () => ({
  checkUserPermissionForAsset: vi.fn().mockResolvedValue(undefined),
}));

let integrationTypeRepository: InMemoryIntegrationTypeRepository;
let sut: FindIntegrationTypeBySlugUseCase;

describe("FindIntegrationTypeBySlugUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    integrationTypeRepository = new InMemoryIntegrationTypeRepository();
    sut = new FindIntegrationTypeBySlugUseCase(integrationTypeRepository);
  });

  it("deve retornar tipo de integração quando slug existe", async () => {
    const userId = randomUUID();

    await integrationTypeRepository.create({
      name: "GitHub",
      slug: "github",
      description: "Integração com GitHub",
    });

    const organizationId = randomUUID();

    const result = await sut.execute(userId, organizationId, "github");

    expect(result).not.toBeNull();
    expect(result?.slug).toBe("github");
    expect(result?.name).toBe("GitHub");
  });

  it("deve retornar null quando slug não existe", async () => {
    const userId = randomUUID();

    const result = await sut.execute(userId, randomUUID(), "inexistente");

    expect(result).toBeNull();
  });
});

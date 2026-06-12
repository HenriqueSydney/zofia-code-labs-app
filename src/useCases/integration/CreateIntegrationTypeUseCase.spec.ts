import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ConflictError } from "../../errors/ConflictError";
import { InMemoryIntegrationTypeRepository } from "../../repositories/in-memory/InMemoryIntegrationTypeRepository";
import { CreateIntegrationTypeUseCase } from "./CreateIntegrationTypeUseCase";

vi.mock("../../lib/auth/checkUserPermissionForAsset", () => ({
  checkUserPermissionForAsset: vi.fn().mockResolvedValue(undefined),
}));

let repository: InMemoryIntegrationTypeRepository;
let sut: CreateIntegrationTypeUseCase;

describe("CreateIntegrationTypeUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    repository = new InMemoryIntegrationTypeRepository();
    sut = new CreateIntegrationTypeUseCase(repository);
  });

  it("deve criar tipo de integração com slug gerado", async () => {
    const result = await sut.execute({
      name: "GitHub Actions",
      description: "CI/CD",
      userId: randomUUID(),
      organizationId: randomUUID(),
    });

    expect(result.slug).toBe("github-actions");
    expect(repository.items).toHaveLength(1);
  });

  it("não deve criar integração com slug duplicado", async () => {
    const payload = {
      name: "GitHub",
      description: "Repo",
      userId: randomUUID(),
      organizationId: randomUUID(),
    };

    await sut.execute(payload);

    await expect(() => sut.execute(payload)).rejects.toBeInstanceOf(
      ConflictError,
    );
  });
});

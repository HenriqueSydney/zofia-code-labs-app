import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { InMemoryIntegrationTypeRepository } from "../../repositories/in-memory/InMemoryIntegrationTypeRepository";
import { ListIntegrationTypeUseCase } from "./ListIntegrationTypeUseCase";

vi.mock("../../lib/auth/checkUserPermissionForAsset", () => ({
  checkUserPermissionForAsset: vi.fn().mockResolvedValue(undefined),
}));

let repository: InMemoryIntegrationTypeRepository;
let sut: ListIntegrationTypeUseCase;

describe("ListIntegrationTypeUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    repository = new InMemoryIntegrationTypeRepository();
    sut = new ListIntegrationTypeUseCase(repository);
  });

  it("deve listar tipos de integração", async () => {
    await repository.create({
      name: "SonarQube",
      slug: "sonarqube",
      description: "Qualidade",
    });

    const result = await sut.execute(randomUUID(), randomUUID());

    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe("sonarqube");
  });
});

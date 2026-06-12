import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { InMemoryServiceTypeRepository } from "../../repositories/in-memory/InMemoryServiceTypeRepository";
import { FetchServiceTypeUseCase } from "./FetchServiceTypeUseCase";

vi.mock("../../lib/auth/checkUserPermissionForAsset", () => ({
  checkUserPermissionForAsset: vi.fn().mockResolvedValue(undefined),
}));

let serviceTypeRepository: InMemoryServiceTypeRepository;
let sut: FetchServiceTypeUseCase;

describe("FetchServiceTypeUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    serviceTypeRepository = new InMemoryServiceTypeRepository();
    sut = new FetchServiceTypeUseCase(serviceTypeRepository);
  });

  it("deve listar tipos de serviço da organização", async () => {
    const organizationId = randomUUID();
    const userId = randomUUID();
    const categoryId = randomUUID();

    serviceTypeRepository.categories.push({
      id: categoryId,
      organizationId,
      name: "Desenvolvimento",
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });

    await serviceTypeRepository.create({
      organizationId,
      categoryId,
      name: "App Mobile",
      active: true,
    });

    await serviceTypeRepository.create({
      organizationId,
      categoryId,
      name: "Landing Page",
      active: true,
    });

    const { serviceTypes } = await sut.execute({
      organizationId,
      userId,
    });

    expect(serviceTypes).toHaveLength(2);
    expect(serviceTypes[0].category.name).toBe("Desenvolvimento");
  });

  it("deve filtrar tipos de serviço por query", async () => {
    const organizationId = randomUUID();
    const userId = randomUUID();
    const categoryId = randomUUID();

    serviceTypeRepository.categories.push({
      id: categoryId,
      organizationId,
      name: "Desenvolvimento",
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });

    await serviceTypeRepository.create({
      organizationId,
      categoryId,
      name: "App Mobile",
      active: true,
    });

    await serviceTypeRepository.create({
      organizationId,
      categoryId,
      name: "API REST",
      active: true,
    });

    const { serviceTypes } = await sut.execute({
      organizationId,
      userId,
      query: "mobile",
    });

    expect(serviceTypes).toHaveLength(1);
    expect(serviceTypes[0].name).toBe("App Mobile");
  });
});

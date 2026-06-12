import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ResourceNotFoundError } from "../../errors/ResourceNotFoundError";
import { InMemoryServiceTypeRepository } from "../../repositories/in-memory/InMemoryServiceTypeRepository";
import { GetServiceTypeUseCase } from "./GetServiceTypeUseCase";

vi.mock("../../lib/auth/checkUserPermissionForAsset", () => ({
  checkUserPermissionForAsset: vi.fn().mockResolvedValue(undefined),
}));

let serviceTypeRepository: InMemoryServiceTypeRepository;
let sut: GetServiceTypeUseCase;

describe("GetServiceTypeUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    serviceTypeRepository = new InMemoryServiceTypeRepository();
    sut = new GetServiceTypeUseCase(serviceTypeRepository);
  });

  it("deve retornar serviço quando existir na organização", async () => {
    const organizationId = randomUUID();
    const categoryId = randomUUID();
    const userId = randomUUID();

    serviceTypeRepository.categories.push({
      id: categoryId,
      organizationId,
      name: "Desenvolvimento",
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });

    const created = await serviceTypeRepository.create({
      organizationId,
      categoryId,
      name: "App Mobile",
      active: true,
    });

    const { serviceType } = await sut.execute({
      serviceId: created.id,
      organizationId,
      userId,
    });

    expect(serviceType.name).toBe("App Mobile");
    expect(serviceType.category.name).toBe("Desenvolvimento");
  });

  it("não deve retornar serviço inexistente", async () => {
    await expect(() =>
      sut.execute({
        serviceId: randomUUID(),
        organizationId: randomUUID(),
        userId: randomUUID(),
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });
});

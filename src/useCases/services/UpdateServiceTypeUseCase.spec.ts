import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ResourceNotFoundError } from "../../errors/ResourceNotFoundError";
import { InMemoryServiceTypeRepository } from "../../repositories/in-memory/InMemoryServiceTypeRepository";
import { UpdateServiceTypeUseCase } from "./UpdateServiceTypeUseCase";

vi.mock("../../lib/auth/checkUserPermissionForAsset", () => ({
  checkUserPermissionForAsset: vi.fn().mockResolvedValue(undefined),
}));

let serviceTypeRepository: InMemoryServiceTypeRepository;
let sut: UpdateServiceTypeUseCase;

describe("UpdateServiceTypeUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    serviceTypeRepository = new InMemoryServiceTypeRepository();
    sut = new UpdateServiceTypeUseCase(serviceTypeRepository);
  });

  it("deve atualizar tipo de serviço existente", async () => {
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

    const service = await serviceTypeRepository.create({
      organizationId,
      categoryId,
      name: "App Mobile",
      active: true,
    });

    await sut.execute({
      id: service.id,
      organizationId,
      userId,
      data: { name: "App Mobile Premium", basePrice: 15000 },
    });

    expect(serviceTypeRepository.items[0].name).toBe("App Mobile Premium");
    expect(serviceTypeRepository.items[0].basePrice?.toNumber()).toBe(15000);
  });

  it("não deve atualizar tipo de serviço inexistente", async () => {
    await expect(() =>
      sut.execute({
        id: randomUUID(),
        organizationId: randomUUID(),
        userId: randomUUID(),
        data: { name: "X" },
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });
});

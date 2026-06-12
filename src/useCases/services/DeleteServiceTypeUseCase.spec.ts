import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ResourceNotFoundError } from "../../errors/ResourceNotFoundError";
import { InMemoryServiceTypeRepository } from "../../repositories/in-memory/InMemoryServiceTypeRepository";
import { DeleteServiceTypeUseCase } from "./DeleteServiceTypeUseCase";

vi.mock("../../lib/auth/checkUserPermissionForAsset", () => ({
  checkUserPermissionForAsset: vi.fn().mockResolvedValue(undefined),
}));

let serviceTypeRepository: InMemoryServiceTypeRepository;
let sut: DeleteServiceTypeUseCase;

describe("DeleteServiceTypeUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    serviceTypeRepository = new InMemoryServiceTypeRepository();
    sut = new DeleteServiceTypeUseCase(serviceTypeRepository);
  });

  it("deve remover tipo de serviço existente", async () => {
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

    await sut.execute({ id: service.id, organizationId, userId });

    expect(serviceTypeRepository.items[0].deletedAt).not.toBeNull();
  });

  it("não deve remover tipo de serviço inexistente", async () => {
    await expect(() =>
      sut.execute({
        id: randomUUID(),
        organizationId: randomUUID(),
        userId: randomUUID(),
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });
});

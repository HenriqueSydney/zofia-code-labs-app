import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ResourceNotFoundError } from "../../../errors/ResourceNotFoundError";
import { InMemoryServiceDefaultBacklogItemsRepository } from "../../../repositories/in-memory/InMemoryServiceDefaultBacklogItemsRepository";
import { InMemoryServiceTypeRepository } from "../../../repositories/in-memory/InMemoryServiceTypeRepository";
import { ListServiceDefaultBacklogsItemsUseCase } from "./ListServiceDefaultBacklogsItemsUseCase";

vi.mock("../../../lib/auth/checkUserPermissionForAsset", () => ({
  checkUserPermissionForAsset: vi.fn().mockResolvedValue(undefined),
}));

let serviceTypeRepository: InMemoryServiceTypeRepository;
let backlogRepository: InMemoryServiceDefaultBacklogItemsRepository;
let sut: ListServiceDefaultBacklogsItemsUseCase;

describe("ListServiceDefaultBacklogsItemsUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    serviceTypeRepository = new InMemoryServiceTypeRepository();
    backlogRepository = new InMemoryServiceDefaultBacklogItemsRepository();
    sut = new ListServiceDefaultBacklogsItemsUseCase(
      serviceTypeRepository,
      backlogRepository,
    );
  });

  it("deve listar itens padrão do backlog do serviço", async () => {
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

    await backlogRepository.create({
      organizationId,
      serviceTypeId: service.id,
      title: "Setup inicial",
      description: "Configurar repositório",
      points: 3,
    });

    const result = await sut.execute({
      organizationId,
      userId,
      serviceId: service.id,
    });

    expect(result.totalOfRegisters).toBe(1);
    expect(result.items[0].title).toBe("Setup inicial");
  });

  it("não deve listar backlog de serviço inexistente", async () => {
    await expect(() =>
      sut.execute({
        organizationId: randomUUID(),
        userId: randomUUID(),
        serviceId: randomUUID(),
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });
});

import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ResourceNotFoundError } from "../../../errors/ResourceNotFoundError";
import { InMemoryServiceDefaultBacklogItemsRepository } from "../../../repositories/in-memory/InMemoryServiceDefaultBacklogItemsRepository";
import { InMemoryServiceTypeRepository } from "../../../repositories/in-memory/InMemoryServiceTypeRepository";
import { CreateServiceDefaultBacklogItemUseCase } from "./CreateServiceDefaultBacklogItemUseCase";

vi.mock("../../../lib/auth/checkUserPermissionForAsset", () => ({
  checkUserPermissionForAsset: vi.fn().mockResolvedValue(undefined),
}));

let serviceTypeRepository: InMemoryServiceTypeRepository;
let backlogRepository: InMemoryServiceDefaultBacklogItemsRepository;
let sut: CreateServiceDefaultBacklogItemUseCase;

describe("CreateServiceDefaultBacklogItemUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    serviceTypeRepository = new InMemoryServiceTypeRepository();
    backlogRepository = new InMemoryServiceDefaultBacklogItemsRepository();
    sut = new CreateServiceDefaultBacklogItemUseCase(
      backlogRepository,
      serviceTypeRepository,
    );
  });

  it("deve criar item padrão no backlog do serviço", async () => {
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

    const item = await sut.execute({
      organizationId,
      userId,
      data: {
        serviceTypeId: service.id,
        title: "Autenticação",
        description: "Login e cadastro",
        points: 5,
      },
    });

    expect(item.title).toBe("Autenticação");
    expect(backlogRepository.items).toHaveLength(1);
  });

  it("não deve criar item para serviço inexistente", async () => {
    await expect(() =>
      sut.execute({
        organizationId: randomUUID(),
        userId: randomUUID(),
        data: {
          serviceTypeId: randomUUID(),
          title: "Item",
          description: "Desc",
        },
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });
});

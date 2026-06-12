import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ResourceNotFoundError } from "../../../errors/ResourceNotFoundError";
import { InMemoryServiceDefaultBacklogItemsRepository } from "../../../repositories/in-memory/InMemoryServiceDefaultBacklogItemsRepository";
import { ReorderServiceDefaultBacklogItemUseCase } from "./ReorderServiceDefaultBacklogItemUseCase";

vi.mock("../../../lib/auth/checkUserPermissionForAsset", () => ({
  checkUserPermissionForAsset: vi.fn().mockResolvedValue(undefined),
}));

let repository: InMemoryServiceDefaultBacklogItemsRepository;
let sut: ReorderServiceDefaultBacklogItemUseCase;

describe("ReorderServiceDefaultBacklogItemUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    repository = new InMemoryServiceDefaultBacklogItemsRepository();
    sut = new ReorderServiceDefaultBacklogItemUseCase(repository);
  });

  it("deve reordenar item do backlog padrão do serviço", async () => {
    const organizationId = randomUUID();
    const serviceTypeId = randomUUID();
    const userId = randomUUID();

    const itemA = await repository.create({
      organizationId,
      serviceTypeId,
      title: "Task A",
      description: "Desc A",
    });

    const itemB = await repository.create({
      organizationId,
      serviceTypeId,
      title: "Task B",
      description: "Desc B",
    });

    const allSortedIds = [itemB.id, itemA.id];

    await sut.execute({
      id: itemB.id,
      newPositionIndex: 0,
      allSortedIds,
      userId,
    });

    const reordered = repository.items.find((item) => item.id === itemB.id);
    const reference = repository.items.find((item) => item.id === itemA.id);

    expect(reordered).toBeDefined();
    expect(reference).toBeDefined();
    expect(reordered!.order).toBeLessThan(reference!.order);
  });

  it("não deve reordenar item inexistente", async () => {
    await expect(() =>
      sut.execute({
        id: randomUUID(),
        newPositionIndex: 0,
        allSortedIds: [],
        userId: randomUUID(),
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });
});

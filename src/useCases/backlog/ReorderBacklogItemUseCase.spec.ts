import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BacklogStatus } from "../../generated/prisma/client";
import { ResourceNotFoundError } from "../../errors/ResourceNotFoundError";
import { InMemoryBacklogItemsRepository } from "../../repositories/in-memory/InMemoryBacklogItemsRepository";
import { ReorderBacklogItemUseCase } from "./ReorderBacklogItemUseCase";

vi.mock("../../lib/auth/checkUserPermissionForAsset", () => ({
  checkUserPermissionForAsset: vi.fn().mockResolvedValue(undefined),
}));

let backlogItemsRepository: InMemoryBacklogItemsRepository;
let sut: ReorderBacklogItemUseCase;

describe("ReorderBacklogItemUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    backlogItemsRepository = new InMemoryBacklogItemsRepository();
    sut = new ReorderBacklogItemUseCase(backlogItemsRepository);
  });

  it("deve reordenar item do backlog existente", async () => {
    const projectId = randomUUID();
    const organizationId = randomUUID();
    const userId = randomUUID();

    const itemA = await backlogItemsRepository.create({
      title: "Task A",
      description: "Desc A",
      projectId,
      organizationId,
      status: BacklogStatus.TODO,
    });

    const itemB = await backlogItemsRepository.create({
      title: "Task B",
      description: "Desc B",
      projectId,
      organizationId,
      status: BacklogStatus.TODO,
    });

    const allSortedIds = [itemB.id, itemA.id];

    await sut.execute({
      id: itemA.id,
      newPositionIndex: 0,
      allSortedIds,
      userId,
    });

    const reordered = backlogItemsRepository.items.find((i) => i.id === itemA.id);
    const reference = backlogItemsRepository.items.find((i) => i.id === itemB.id);

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

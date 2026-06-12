import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BacklogStatus } from "../../generated/prisma/client";
import { ResourceNotFoundError } from "../../errors/ResourceNotFoundError";
import { InMemoryBacklogItemsRepository } from "../../repositories/in-memory/InMemoryBacklogItemsRepository";
import { GetBacklogItemUseCase } from "./GetBacklogItemUseCase";

vi.mock("../../lib/auth/checkUserPermissionForAsset", () => ({
  checkUserPermissionForAsset: vi.fn().mockResolvedValue(undefined),
}));

describe("GetBacklogItemUseCase", () => {
  let backlogItemsRepository: InMemoryBacklogItemsRepository;
  let sut: GetBacklogItemUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    backlogItemsRepository = new InMemoryBacklogItemsRepository();
    sut = new GetBacklogItemUseCase(backlogItemsRepository);
  });

  it("deve retornar item do backlog existente", async () => {
    const item = await backlogItemsRepository.create({
      title: "Task A",
      description: "Desc",
      projectId: randomUUID(),
      organizationId: randomUUID(),
      status: BacklogStatus.TODO,
    });

    const result = await sut.execute({ id: item.id, userId: randomUUID() });

    expect(result.title).toBe("Task A");
  });

  it("não deve retornar item inexistente", async () => {
    await expect(() =>
      sut.execute({ id: randomUUID(), userId: randomUUID() }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });
});

import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BacklogStatus } from "../../generated/prisma/client";
import { ResourceNotFoundError } from "../../errors/ResourceNotFoundError";
import { InMemoryBacklogItemsRepository } from "../../repositories/in-memory/InMemoryBacklogItemsRepository";
import { UpdateBacklogItemUseCase } from "./UpdateBacklogItemUseCase";

vi.mock("../../lib/auth/checkUserPermissionForAsset", () => ({
  checkUserPermissionForAsset: vi.fn().mockResolvedValue(undefined),
}));

let backlogItemsRepository: InMemoryBacklogItemsRepository;
let sut: UpdateBacklogItemUseCase;

describe("UpdateBacklogItemUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    backlogItemsRepository = new InMemoryBacklogItemsRepository();
    sut = new UpdateBacklogItemUseCase(backlogItemsRepository);
  });

  it("deve atualizar item do backlog existente", async () => {
    const item = await backlogItemsRepository.create({
      title: "Task A",
      description: "Desc",
      projectId: randomUUID(),
      organizationId: randomUUID(),
      status: BacklogStatus.TODO,
    });

    const updated = await sut.execute({
      data: { id: item.id, title: "Task A — revisada" },
      userId: randomUUID(),
    });

    expect(updated.title).toBe("Task A — revisada");
  });

  it("não deve atualizar item inexistente", async () => {
    await expect(() =>
      sut.execute({
        data: { id: randomUUID(), title: "X" },
        userId: randomUUID(),
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });
});

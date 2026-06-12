import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BacklogStatus } from "../../generated/prisma/client";
import { ResourceNotFoundError } from "../../errors/ResourceNotFoundError";
import { InMemoryBacklogItemsRepository } from "../../repositories/in-memory/InMemoryBacklogItemsRepository";
import { DeleteBacklogItemUseCase } from "./DeleteBacklogItemUseCase";

vi.mock("../../lib/auth/checkUserPermissionForAsset", () => ({
  checkUserPermissionForAsset: vi.fn().mockResolvedValue(undefined),
}));

let backlogItemsRepository: InMemoryBacklogItemsRepository;
let sut: DeleteBacklogItemUseCase;

describe("DeleteBacklogItemUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    backlogItemsRepository = new InMemoryBacklogItemsRepository();
    sut = new DeleteBacklogItemUseCase(backlogItemsRepository);
  });

  it("deve remover item do backlog existente", async () => {
    const projectId = randomUUID();
    const organizationId = randomUUID();
    const userId = randomUUID();

    const item = await backlogItemsRepository.create({
      title: "Implementar login",
      description: "OAuth",
      projectId,
      organizationId,
      status: BacklogStatus.TODO,
    });

    await sut.execute({ id: item.id, userId });

    expect(backlogItemsRepository.items).toHaveLength(0);
  });

  it("não deve remover item inexistente", async () => {
    await expect(() =>
      sut.execute({ id: randomUUID(), userId: randomUUID() }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });
});

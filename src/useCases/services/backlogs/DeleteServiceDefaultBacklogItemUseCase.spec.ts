import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ResourceNotFoundError } from "../../../errors/ResourceNotFoundError";
import { InMemoryServiceDefaultBacklogItemsRepository } from "../../../repositories/in-memory/InMemoryServiceDefaultBacklogItemsRepository";
import { DeleteServiceDefaultBacklogItemUseCase } from "./DeleteServiceDefaultBacklogItemUseCase";

vi.mock("../../../lib/auth/checkUserPermissionForAsset", () => ({
  checkUserPermissionForAsset: vi.fn().mockResolvedValue(undefined),
}));

let backlogRepository: InMemoryServiceDefaultBacklogItemsRepository;
let sut: DeleteServiceDefaultBacklogItemUseCase;

describe("DeleteServiceDefaultBacklogItemUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    backlogRepository = new InMemoryServiceDefaultBacklogItemsRepository();
    sut = new DeleteServiceDefaultBacklogItemUseCase(backlogRepository);
  });

  it("deve remover item do backlog padrão do serviço", async () => {
    const organizationId = randomUUID();
    const userId = randomUUID();
    const serviceTypeId = randomUUID();

    const item = await backlogRepository.create({
      organizationId,
      serviceTypeId,
      title: "Setup",
      description: "Config inicial",
      points: 2,
    });

    await sut.execute({ id: item.id, userId });

    expect(backlogRepository.items[0].deletedAt).not.toBeNull();
  });

  it("não deve remover item inexistente", async () => {
    await expect(() =>
      sut.execute({ id: randomUUID(), userId: randomUUID() }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });
});

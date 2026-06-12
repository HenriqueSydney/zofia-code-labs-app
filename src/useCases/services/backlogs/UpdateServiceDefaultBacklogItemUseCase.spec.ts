import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ResourceNotFoundError } from "../../../errors/ResourceNotFoundError";
import { InMemoryServiceDefaultBacklogItemsRepository } from "../../../repositories/in-memory/InMemoryServiceDefaultBacklogItemsRepository";
import { UpdateServiceDefaultBacklogItemUseCase } from "./UpdateServiceDefaultBacklogItemUseCase";

vi.mock("../../../lib/auth/checkUserPermissionForAsset", () => ({
  checkUserPermissionForAsset: vi.fn().mockResolvedValue(undefined),
}));

let backlogRepository: InMemoryServiceDefaultBacklogItemsRepository;
let sut: UpdateServiceDefaultBacklogItemUseCase;

describe("UpdateServiceDefaultBacklogItemUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    backlogRepository = new InMemoryServiceDefaultBacklogItemsRepository();
    sut = new UpdateServiceDefaultBacklogItemUseCase(backlogRepository);
  });

  it("deve atualizar item do backlog padrão do serviço", async () => {
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

    const updated = await sut.execute({
      userId,
      data: {
        id: item.id,
        title: "Setup completo",
        points: 4,
      },
    });

    expect(updated.title).toBe("Setup completo");
    expect(backlogRepository.items[0].points).toBe(4);
  });

  it("não deve atualizar item inexistente", async () => {
    await expect(() =>
      sut.execute({
        userId: randomUUID(),
        data: { id: randomUUID(), title: "X" },
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });
});

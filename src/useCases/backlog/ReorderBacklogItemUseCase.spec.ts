import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BacklogStatus } from "../../generated/prisma/client";
import { ResourceNotFoundError } from "../../errors/ResourceNotFoundError";
import { InMemoryBacklogItemsRepository } from "../../repositories/in-memory/InMemoryBacklogItemsRepository";
import { InMemoryProjectsRepository } from "../../repositories/in-memory/InMemoryProjectsRepository";
import { ReorderBacklogItemUseCase } from "./ReorderBacklogItemUseCase";

vi.mock("../../lib/auth/checkUserPermissionForAsset", () => ({
  checkUserPermissionForAsset: vi.fn().mockResolvedValue(undefined),
}));

let backlogItemsRepository: InMemoryBacklogItemsRepository;
let projectsRepository: InMemoryProjectsRepository;
let sut: ReorderBacklogItemUseCase;

describe("ReorderBacklogItemUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    backlogItemsRepository = new InMemoryBacklogItemsRepository();
    projectsRepository = new InMemoryProjectsRepository();
    sut = new ReorderBacklogItemUseCase(
      backlogItemsRepository,
      projectsRepository,
    );
  });

  it("deve reordenar item do backlog existente", async () => {
    const organizationId = randomUUID();
    const userId = randomUUID();
    const clientId = randomUUID();

    const project = await projectsRepository.create({
      name: "Projeto ERP",
      description: "Descrição",
      slug: "projeto-erp",
      clientId,
      createdBy: userId,
      organizationId,
    });

    projectsRepository.clients.push({
      id: clientId,
      companyName: "Cliente LTDA",
      slug: "cliente",
      tradeName: "Cliente",
    });

    const itemA = await backlogItemsRepository.create({
      title: "Task A",
      description: "Desc A",
      projectId: project.id,
      organizationId,
      status: BacklogStatus.TODO,
    });

    const itemB = await backlogItemsRepository.create({
      title: "Task B",
      description: "Desc B",
      projectId: project.id,
      organizationId,
      status: BacklogStatus.TODO,
    });

    const allSortedIds = [itemB.id, itemA.id];

    const result = await sut.execute({
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
    expect(result).toEqual({
      slug: "projeto-erp",
      clientSlug: "cliente",
    });
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

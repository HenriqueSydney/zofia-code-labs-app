import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ResourceNotFoundError } from "../../errors/ResourceNotFoundError";
import { date } from "../../lib/dayjs";
import { InMemoryBacklogItemsRepository } from "../../repositories/in-memory/InMemoryBacklogItemsRepository";
import { InMemoryProjectsRepository } from "../../repositories/in-memory/InMemoryProjectsRepository";
import { SyncServiceDefaultBacklogUseCase } from "./SyncServiceDefaultBacklogUseCase";

vi.mock("../../lib/auth/checkUserPermissionForAsset", () => ({
  checkUserPermissionForAsset: vi.fn().mockResolvedValue(undefined),
}));

let backlogItemsRepository: InMemoryBacklogItemsRepository;
let projectsRepository: InMemoryProjectsRepository;
let sut: SyncServiceDefaultBacklogUseCase;

describe("SyncServiceDefaultBacklogUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    backlogItemsRepository = new InMemoryBacklogItemsRepository();
    projectsRepository = new InMemoryProjectsRepository();
    sut = new SyncServiceDefaultBacklogUseCase(
      backlogItemsRepository,
      projectsRepository,
    );
  });

  it("deve sincronizar itens padrão do serviço para o projeto", async () => {
    const organizationId = randomUUID();
    const userId = randomUUID();
    const clientId = randomUUID();
    const serviceTypeId = randomUUID();
    const now = date().toDate();

    const project = await projectsRepository.create({
      name: "Projeto ERP",
      description: "Descrição",
      slug: "projeto-erp",
      clientId,
      createdBy: userId,
      organizationId,
    });

    const sourceId = randomUUID();
    backlogItemsRepository.serviceDefaultSourceItems.push({
      id: sourceId,
      title: "Setup inicial",
      description: "Configurar ambiente",
      order: 1000,
      points: 3,
      priority: "MEDIUM",
      serviceTypeId,
      organizationId,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    });

    const itemsCreatedCount = await sut.execute({
      projectId: project.id,
      serviceTypeId,
      userId,
      organizationId,
    });

    expect(itemsCreatedCount).toBe(1);
    expect(backlogItemsRepository.items).toHaveLength(1);
    expect(backlogItemsRepository.items[0].title).toBe("Setup inicial");
    expect(backlogItemsRepository.items[0].serviceDefaultBacklogItemId).toBe(
      sourceId,
    );
  });

  it("não deve sincronizar quando projeto não existe", async () => {
    await expect(() =>
      sut.execute({
        projectId: randomUUID(),
        serviceTypeId: randomUUID(),
        userId: randomUUID(),
        organizationId: randomUUID(),
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });
});

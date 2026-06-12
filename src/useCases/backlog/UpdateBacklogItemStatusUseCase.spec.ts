import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BacklogStatus } from "../../generated/prisma/client";
import { ResourceNotFoundError } from "../../errors/ResourceNotFoundError";
import { InMemoryBacklogItemsRepository } from "../../repositories/in-memory/InMemoryBacklogItemsRepository";
import { InMemoryProjectsRepository } from "../../repositories/in-memory/InMemoryProjectsRepository";
import { UpdateBacklogItemStatusUseCase } from "./UpdateBacklogItemStatusUseCase";

vi.mock("../../lib/auth/checkUserPermissionForAsset", () => ({
  checkUserPermissionForAsset: vi.fn().mockResolvedValue(undefined),
}));

let backlogItemsRepository: InMemoryBacklogItemsRepository;
let projectsRepository: InMemoryProjectsRepository;
let sut: UpdateBacklogItemStatusUseCase;

describe("UpdateBacklogItemStatusUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    backlogItemsRepository = new InMemoryBacklogItemsRepository();
    projectsRepository = new InMemoryProjectsRepository();
    sut = new UpdateBacklogItemStatusUseCase(
      backlogItemsRepository,
      projectsRepository,
    );
  });

  it("deve atualizar status do item do backlog existente", async () => {
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

    const item = await backlogItemsRepository.create({
      title: "Implementar login",
      description: "OAuth",
      projectId: project.id,
      organizationId,
      status: BacklogStatus.TODO,
    });

    const result = await sut.execute({
      id: item.id,
      newStatus: BacklogStatus.DONE,
      userId,
    });

    expect(result.projectId).toBe(project.id);
    expect(result.slug).toBe("projeto-erp");
    expect(result.clientSlug).toBe("cliente");

    const updated = backlogItemsRepository.items.find((i) => i.id === item.id);
    expect(updated?.status).toBe(BacklogStatus.DONE);
  });

  it("não deve atualizar status de item inexistente", async () => {
    await expect(() =>
      sut.execute({
        id: randomUUID(),
        newStatus: BacklogStatus.DONE,
        userId: randomUUID(),
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });

  it("deve lançar erro quando projeto do item não existir", async () => {
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

    const item = await backlogItemsRepository.create({
      title: "Item órfão",
      description: "Desc",
      projectId: project.id,
      organizationId,
      status: BacklogStatus.TODO,
    });

    projectsRepository.items = projectsRepository.items.filter(
      (p) => p.id !== project.id,
    );

    await expect(() =>
      sut.execute({
        id: item.id,
        newStatus: BacklogStatus.DONE,
        userId,
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });
});

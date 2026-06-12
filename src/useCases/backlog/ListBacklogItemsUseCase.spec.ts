import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BacklogStatus } from "../../generated/prisma/client";
import { ResourceNotFoundError } from "../../errors/ResourceNotFoundError";
import { InMemoryBacklogItemsRepository } from "../../repositories/in-memory/InMemoryBacklogItemsRepository";
import { InMemoryProjectsRepository } from "../../repositories/in-memory/InMemoryProjectsRepository";
import { ListBacklogItemsUseCase } from "./ListBacklogItemsUseCase";

vi.mock("../../lib/auth/checkUserPermissionForAsset", () => ({
  checkUserPermissionForAsset: vi.fn().mockResolvedValue(undefined),
}));

let backlogItemsRepository: InMemoryBacklogItemsRepository;
let projectsRepository: InMemoryProjectsRepository;
let sut: ListBacklogItemsUseCase;

describe("ListBacklogItemsUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    backlogItemsRepository = new InMemoryBacklogItemsRepository();
    projectsRepository = new InMemoryProjectsRepository();
    sut = new ListBacklogItemsUseCase(
      backlogItemsRepository,
      projectsRepository,
    );
  });

  it("deve listar itens do backlog quando projeto existe", async () => {
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

    await backlogItemsRepository.create({
      title: "Implementar login",
      description: "OAuth",
      projectId: project.id,
      organizationId,
      status: BacklogStatus.TODO,
    });

    await backlogItemsRepository.create({
      title: "Configurar CI",
      description: "Pipeline",
      projectId: project.id,
      organizationId,
      status: BacklogStatus.IN_PROGRESS,
    });

    const result = await sut.execute({
      projectId: project.id,
      userId,
    });

    expect(result.items).toHaveLength(2);
    expect(result.totalOfRegisters).toBe(2);
  });

  it("deve aplicar paginação quando page e numberPerPage forem informados", async () => {
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

    for (let i = 0; i < 3; i++) {
      await backlogItemsRepository.create({
        title: `Item ${i}`,
        description: "Desc",
        projectId: project.id,
        organizationId,
        status: BacklogStatus.TODO,
      });
    }

    const result = await sut.execute({
      projectId: project.id,
      userId,
      page: 1,
      numberPerPage: 2,
    });

    expect(result.items).toHaveLength(2);
    expect(result.totalOfRegisters).toBe(3);
  });

  it("deve ignorar filtros ALL e retornar todos os status", async () => {
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

    await backlogItemsRepository.create({
      title: "Todo",
      description: "A",
      projectId: project.id,
      organizationId,
      status: BacklogStatus.TODO,
    });
    await backlogItemsRepository.create({
      title: "Done",
      description: "B",
      projectId: project.id,
      organizationId,
      status: BacklogStatus.DONE,
    });

    const result = await sut.execute({
      projectId: project.id,
      userId,
      status: "ALL",
      priority: "ALL",
    });

    expect(result.items).toHaveLength(2);
  });

  it("deve filtrar por status específico e array de status", async () => {
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

    await backlogItemsRepository.create({
      title: "Todo",
      description: "A",
      projectId: project.id,
      organizationId,
      status: BacklogStatus.TODO,
    });
    await backlogItemsRepository.create({
      title: "Done",
      description: "B",
      projectId: project.id,
      organizationId,
      status: BacklogStatus.DONE,
    });
    await backlogItemsRepository.create({
      title: "Review",
      description: "C",
      projectId: project.id,
      organizationId,
      status: BacklogStatus.REVIEW,
    });

    const onlyDone = await sut.execute({
      projectId: project.id,
      userId,
      status: BacklogStatus.DONE,
    });

    expect(onlyDone.items).toHaveLength(1);
    expect(onlyDone.items[0].title).toBe("Done");

    const todoOrReview = await sut.execute({
      projectId: project.id,
      userId,
      status: [BacklogStatus.TODO, BacklogStatus.REVIEW],
    });

    expect(todoOrReview.items).toHaveLength(2);
  });

  it("não deve aplicar paginação quando apenas page for informado", async () => {
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

    await backlogItemsRepository.create({
      title: "Item único",
      description: "Desc",
      projectId: project.id,
      organizationId,
      status: BacklogStatus.TODO,
    });

    const result = await sut.execute({
      projectId: project.id,
      userId,
      page: 1,
    });

    expect(result.items).toHaveLength(1);
  });

  it("deve filtrar por prioridade específica", async () => {
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

    await backlogItemsRepository.create({
      title: "Alta",
      description: "A",
      projectId: project.id,
      organizationId,
      status: BacklogStatus.TODO,
      priority: "HIGH",
    });
    await backlogItemsRepository.create({
      title: "Baixa",
      description: "B",
      projectId: project.id,
      organizationId,
      status: BacklogStatus.TODO,
      priority: "LOW",
    });

    const result = await sut.execute({
      projectId: project.id,
      userId,
      priority: "HIGH",
    });

    expect(result.items).toHaveLength(1);
    expect(result.items[0].title).toBe("Alta");
  });

  it("não deve listar itens quando projeto não existe", async () => {
    await expect(() =>
      sut.execute({
        projectId: randomUUID(),
        userId: randomUUID(),
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });
});

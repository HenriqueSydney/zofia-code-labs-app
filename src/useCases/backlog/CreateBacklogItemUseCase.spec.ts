import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ResourceNotFoundError } from "../../errors/ResourceNotFoundError";
import { InMemoryBacklogItemsRepository } from "../../repositories/in-memory/InMemoryBacklogItemsRepository";
import { InMemoryProjectsRepository } from "../../repositories/in-memory/InMemoryProjectsRepository";
import { CreateBacklogItemUseCase } from "./CreateBacklogItemUseCase";

vi.mock("../../lib/auth/checkUserPermissionForAsset", () => ({
  checkUserPermissionForAsset: vi.fn().mockResolvedValue(undefined),
}));

let backlogItemsRepository: InMemoryBacklogItemsRepository;
let projectsRepository: InMemoryProjectsRepository;
let sut: CreateBacklogItemUseCase;

describe("CreateBacklogItemUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    backlogItemsRepository = new InMemoryBacklogItemsRepository();
    projectsRepository = new InMemoryProjectsRepository();
    sut = new CreateBacklogItemUseCase(
      backlogItemsRepository,
      projectsRepository,
    );
  });

  it("deve criar item de backlog quando projeto existe", async () => {
    const organizationId = randomUUID();
    const userId = randomUUID();
    const clientId = randomUUID();

    const project = await projectsRepository.create({
      name: "Projeto ERP",
      description: "Descrição do projeto",
      slug: "projeto-erp",
      clientId,
      createdBy: userId,
      organizationId,
    });

    const result = await sut.execute({
      userId,
      data: {
        title: "Implementar login",
        description: "Criar fluxo de autenticação",
        projectId: project.id,
      },
    });

    expect(result.title).toBe("Implementar login");
    expect(result.projectId).toBe(project.id);
    expect(result.organizationId).toBe(organizationId);
    expect(backlogItemsRepository.items).toHaveLength(1);
  });

  it("não deve criar item de backlog quando projeto não existe", async () => {
    const userId = randomUUID();

    await expect(() =>
      sut.execute({
        userId,
        data: {
          title: "Implementar login",
          description: "Criar fluxo de autenticação",
          projectId: randomUUID(),
        },
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);

    expect(backlogItemsRepository.items).toHaveLength(0);
  });
});

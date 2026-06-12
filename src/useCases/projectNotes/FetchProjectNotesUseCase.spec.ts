import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ResourceNotFoundError } from "../../errors/ResourceNotFoundError";
import { InMemoryProjectNotesRepository } from "../../repositories/in-memory/InMemoryProjectNotesRepository";
import { InMemoryProjectsRepository } from "../../repositories/in-memory/InMemoryProjectsRepository";
import { FetchProjectNotesUseCase } from "./FetchProjectNotesUseCase";

vi.mock("../../lib/auth/checkUserPermissionForAsset", () => ({
  checkUserPermissionForAsset: vi.fn().mockResolvedValue(undefined),
}));

let projectNotesRepository: InMemoryProjectNotesRepository;
let projectsRepository: InMemoryProjectsRepository;
let sut: FetchProjectNotesUseCase;

describe("FetchProjectNotesUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    projectNotesRepository = new InMemoryProjectNotesRepository();
    projectsRepository = new InMemoryProjectsRepository();
    sut = new FetchProjectNotesUseCase(
      projectNotesRepository,
      projectsRepository,
    );
  });

  it("deve listar observações do projeto", async () => {
    const organizationId = randomUUID();
    const userId = randomUUID();
    const clientId = randomUUID();

    projectsRepository.clients.push({
      id: clientId,
      companyName: "Acme",
      slug: "acme",
      tradeName: "Acme",
    });

    const project = await projectsRepository.create({
      name: "Projeto Alpha",
      description: "Desc",
      slug: "projeto-alpha",
      clientId,
      createdBy: userId,
      organizationId,
    });

    projectNotesRepository.users.push({
      id: userId,
      name: "Ana",
      email: "ana@zofia.com",
      emailVerified: null,
      image: null,
      passwordHash: "hash",
      createdAt: new Date(),
      updatedAt: new Date(),
    } as (typeof projectNotesRepository.users)[number]);

    projectNotesRepository.projects.push({
      ...project,
      client: { slug: "acme" },
    });

    await projectNotesRepository.create({
      content: "Kickoff realizado",
      projectId: project.id,
      userId,
    });

    const result = await sut.execute({
      projectId: project.id,
      userId,
    });

    expect(result.totalOfRegisters).toBe(1);
    expect(result.projectNotes[0].content).toBe("Kickoff realizado");
  });

  it("não deve listar observações de projeto inexistente", async () => {
    await expect(() =>
      sut.execute({
        projectId: randomUUID(),
        userId: randomUUID(),
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });
});

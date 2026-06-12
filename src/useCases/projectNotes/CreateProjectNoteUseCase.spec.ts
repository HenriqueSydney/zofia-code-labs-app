import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ResourceNotFoundError } from "../../errors/ResourceNotFoundError";
import { InMemoryProjectNotesRepository } from "../../repositories/in-memory/InMemoryProjectNotesRepository";
import { InMemoryProjectsRepository } from "../../repositories/in-memory/InMemoryProjectsRepository";
import { CreateProjectNoteUseCase } from "./CreateProjectNoteUseCase";

vi.mock("../../lib/auth/checkUserPermissionForAsset", () => ({
  checkUserPermissionForAsset: vi.fn().mockResolvedValue(undefined),
}));

let projectNotesRepository: InMemoryProjectNotesRepository;
let projectsRepository: InMemoryProjectsRepository;
let sut: CreateProjectNoteUseCase;

describe("CreateProjectNoteUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    projectNotesRepository = new InMemoryProjectNotesRepository();
    projectsRepository = new InMemoryProjectsRepository();
    sut = new CreateProjectNoteUseCase(
      projectNotesRepository,
      projectsRepository,
    );
  });

  it("deve criar observação em projeto existente", async () => {
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

    const result = await sut.execute({
      content: "Kickoff realizado",
      projectId: project.id,
      userId,
    });

    expect(result.id).toBe(project.id);
    expect(projectNotesRepository.items).toHaveLength(1);
    expect(projectNotesRepository.items[0].content).toBe("Kickoff realizado");
  });

  it("não deve criar observação em projeto inexistente", async () => {
    await expect(() =>
      sut.execute({
        content: "Nota",
        projectId: randomUUID(),
        userId: randomUUID(),
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });
});

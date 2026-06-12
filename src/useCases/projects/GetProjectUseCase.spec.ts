import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ResourceNotFoundError } from "../../errors/ResourceNotFoundError";
import { InMemoryProjectsRepository } from "../../repositories/in-memory/InMemoryProjectsRepository";
import { GetProjectUseCase } from "./GetProjectUseCase";

vi.mock("../../lib/auth/checkUserPermissionForAsset", () => ({
  checkUserPermissionForAsset: vi.fn().mockResolvedValue(undefined),
}));

let projectsRepository: InMemoryProjectsRepository;
let sut: GetProjectUseCase;

describe("GetProjectUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    projectsRepository = new InMemoryProjectsRepository();
    sut = new GetProjectUseCase(projectsRepository);
  });

  it("deve retornar projeto por id", async () => {
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

    const { project: result } = await sut.execute({
      projectId: project.id,
      userId,
    });

    expect(result.name).toBe("Projeto Alpha");
    expect(result.slug).toBe("projeto-alpha");
  });

  it("não deve retornar projeto inexistente", async () => {
    await expect(() =>
      sut.execute({ projectId: randomUUID(), userId: randomUUID() }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });
});

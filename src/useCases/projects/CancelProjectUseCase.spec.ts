import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ResourceNotFoundError } from "../../errors/ResourceNotFoundError";
import { InMemoryProjectsRepository } from "../../repositories/in-memory/InMemoryProjectsRepository";
import { CancelProjectUseCase } from "./CancelProjectUseCase";

vi.mock("../../lib/auth/checkUserPermissionForAsset", () => ({
  checkUserPermissionForAsset: vi.fn().mockResolvedValue(undefined),
}));

let projectsRepository: InMemoryProjectsRepository;
let sut: CancelProjectUseCase;

describe("CancelProjectUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    projectsRepository = new InMemoryProjectsRepository();
    sut = new CancelProjectUseCase(projectsRepository);
  });

  it("deve cancelar projeto existente", async () => {
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

    const result = await sut.execute({ projectId: project.id, userId });

    expect(result.slug).toBe("projeto-alpha");
    expect(result.clientSlug).toBe("acme");
    expect(projectsRepository.items[0].status).toBe("CANCELLED");
  });

  it("não deve cancelar projeto inexistente", async () => {
    await expect(() =>
      sut.execute({ projectId: randomUUID(), userId: randomUUID() }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });

  it("não deve cancelar quando projeto desaparece após checagem de permissão", async () => {
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

    const originalFindById = projectsRepository.findById.bind(projectsRepository);
    let calls = 0;
    vi.spyOn(projectsRepository, "findById").mockImplementation(async (id) => {
      calls += 1;
      if (calls === 2) return null;
      return originalFindById(id);
    });

    await expect(() =>
      sut.execute({ projectId: project.id, userId }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });
});

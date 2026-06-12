import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ResourceNotFoundError } from "../../errors/ResourceNotFoundError";
import { InMemoryProjectsRepository } from "../../repositories/in-memory/InMemoryProjectsRepository";
import { GetProjectBySlugUseCase } from "./GetProjectBySlugUseCase";

vi.mock("../../lib/auth/checkUserPermissionForAsset", () => ({
  checkUserPermissionForAsset: vi.fn().mockResolvedValue(undefined),
}));

let projectsRepository: InMemoryProjectsRepository;
let sut: GetProjectBySlugUseCase;

describe("GetProjectBySlugUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    projectsRepository = new InMemoryProjectsRepository();
    sut = new GetProjectBySlugUseCase(projectsRepository);
  });

  it("deve retornar projeto por slug", async () => {
    const organizationId = randomUUID();
    const userId = randomUUID();
    const clientId = randomUUID();

    projectsRepository.clients.push({
      id: clientId,
      companyName: "Acme",
      slug: "acme",
      tradeName: "Acme",
    });

    await projectsRepository.create({
      name: "Projeto Alpha",
      description: "Desc",
      slug: "projeto-alpha",
      clientId,
      createdBy: userId,
      organizationId,
    });

    const { project } = await sut.execute({
      slug: "projeto-alpha",
      userId,
    });

    expect(project.name).toBe("Projeto Alpha");
  });

  it("não deve retornar projeto com slug inexistente", async () => {
    await expect(() =>
      sut.execute({ slug: "inexistente", userId: randomUUID() }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });
});

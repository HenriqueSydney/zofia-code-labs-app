import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { InMemoryProjectsRepository } from "../../repositories/in-memory/InMemoryProjectsRepository";
import { FetchProjectUseCase } from "./FetchProjectUseCase";

vi.mock("../../lib/auth/checkUserPermissionForAsset", () => ({
  checkUserPermissionForAsset: vi.fn().mockResolvedValue(undefined),
}));

let projectsRepository: InMemoryProjectsRepository;
let sut: FetchProjectUseCase;

describe("FetchProjectUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    projectsRepository = new InMemoryProjectsRepository();
    sut = new FetchProjectUseCase(projectsRepository);
  });

  it("deve listar projetos da organização", async () => {
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
      name: "Projeto A",
      description: "Desc A",
      slug: "projeto-a",
      clientId,
      createdBy: userId,
      organizationId,
    });

    await projectsRepository.create({
      name: "Projeto B",
      description: "Desc B",
      slug: "projeto-b",
      clientId,
      createdBy: userId,
      organizationId,
    });

    const result = await sut.execute({
      organizationId,
      userId,
    });

    expect(result.totalOfRegisters).toBe(2);
    expect(result.projects).toHaveLength(2);
  });

  it("deve filtrar projetos por query", async () => {
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
      name: "E-commerce",
      description: "Loja virtual",
      slug: "e-commerce",
      clientId,
      createdBy: userId,
      organizationId,
    });

    await projectsRepository.create({
      name: "App Mobile",
      description: "iOS e Android",
      slug: "app-mobile",
      clientId,
      createdBy: userId,
      organizationId,
    });

    const result = await sut.execute({
      organizationId,
      userId,
      filter: { query: "mobile" },
    });

    expect(result.totalOfRegisters).toBe(1);
    expect(result.projects[0].name).toBe("App Mobile");
  });
});

import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ResourceNotFoundError } from "../../errors/ResourceNotFoundError";
import { InMemoryProjectsRepository } from "../../repositories/in-memory/InMemoryProjectsRepository";
import type { IS3StorageService } from "../../services/s3Client/IS3StorageService";
import { RemoveProjectDocumentUseCase } from "./RemoveProjectDocumentUseCase";

vi.mock("../../lib/auth/checkUserPermissionForAsset", () => ({
  checkUserPermissionForAsset: vi.fn().mockResolvedValue(undefined),
}));

let projectsRepository: InMemoryProjectsRepository;
let storageService: IS3StorageService;
let sut: RemoveProjectDocumentUseCase;

describe("RemoveProjectDocumentUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    projectsRepository = new InMemoryProjectsRepository();
    storageService = {
      getInstance: vi.fn(),
      getFileBuffer: vi.fn(),
      upload: vi.fn(),
      getSignedUrl: vi.fn(),
      delete: vi.fn().mockResolvedValue(undefined),
      list: vi.fn(),
    };
    sut = new RemoveProjectDocumentUseCase(projectsRepository, storageService);
  });

  it("deve remover documento do projeto e do storage", async () => {
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
      documents: [
        {
          url: "https://storage.example.com/projects/projeto-alpha/doc.pdf",
          originalName: "doc.pdf",
          extension: "pdf",
        },
      ],
    });

    const documentId = projectsRepository.projectDocuments[0].id;

    const result = await sut.execute({
      projectId: project.id,
      documentId,
      userId,
    });

    expect(result.slug).toBe("projeto-alpha");
    expect(result.clientSlug).toBe("acme");
    expect(projectsRepository.projectDocuments).toHaveLength(0);
    expect(storageService.delete).toHaveBeenCalledWith(
      "projects/projeto-alpha/doc.pdf",
    );
  });

  it("não deve remover documento de projeto inexistente", async () => {
    await expect(() =>
      sut.execute({
        projectId: randomUUID(),
        documentId: randomUUID(),
        userId: randomUUID(),
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });

  it("não deve remover documento inexistente", async () => {
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

    await expect(() =>
      sut.execute({
        projectId: project.id,
        documentId: randomUUID(),
        userId,
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });

  it("deve remover documento mesmo quando delete no storage falhar", async () => {
    vi.mocked(storageService.delete).mockRejectedValueOnce(new Error("s3 down"));

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

    projectsRepository.projectDocuments.push({
      id: randomUUID(),
      projectId: project.id,
      name: "doc.pdf",
      documentUrlReference: "https://cdn.example.com/projects/doc.pdf",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const documentId = projectsRepository.projectDocuments[0].id;

    const result = await sut.execute({
      projectId: project.id,
      documentId,
      userId,
    });

    expect(result.slug).toBe("projeto-alpha");
    expect(storageService.delete).toHaveBeenCalledWith("projects/doc.pdf");
    expect(projectsRepository.projectDocuments).toHaveLength(0);
  });

  it("deve remover documento sem chamar storage quando URL não gera fileKey", async () => {
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

    projectsRepository.projectDocuments.push({
      id: randomUUID(),
      projectId: project.id,
      name: "doc.pdf",
      documentUrlReference: "https://cdn.example.com/",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const documentId = projectsRepository.projectDocuments[0].id;

    const result = await sut.execute({
      projectId: project.id,
      documentId,
      userId,
    });

    expect(result.slug).toBe("projeto-alpha");
    expect(storageService.delete).not.toHaveBeenCalled();
    expect(projectsRepository.projectDocuments).toHaveLength(0);
  });
});

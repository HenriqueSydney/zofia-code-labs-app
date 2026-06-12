import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ResourceNotFoundError } from "../../errors/ResourceNotFoundError";
import { InMemoryProjectsRepository } from "../../repositories/in-memory/InMemoryProjectsRepository";
import type { IS3StorageService } from "../../services/s3Client/IS3StorageService";
import { prepareFileToUpload } from "../../utils/prepareFileToUpload";
import { UpdateProjectUseCase } from "./UpdateProjectUseCase";

vi.mock("../../lib/auth/checkUserPermissionForAsset", () => ({
  checkUserPermissionForAsset: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../../utils/prepareFileToUpload", () => ({
  prepareFileToUpload: vi.fn().mockResolvedValue({
    buffer: Buffer.from("pdf"),
    key: "projects/projeto-alpha/briefing.pdf",
    mimeType: "application/pdf",
    originalName: "briefing.pdf",
    extension: "pdf",
  }),
}));

let projectsRepository: InMemoryProjectsRepository;
let storageService: IS3StorageService;
let sut: UpdateProjectUseCase;

describe("UpdateProjectUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    projectsRepository = new InMemoryProjectsRepository();
    storageService = {
      getInstance: vi.fn(),
      getFileBuffer: vi.fn(),
      upload: vi.fn().mockResolvedValue({ key: "projects/projeto-alpha/novo.pdf" }),
      getSignedUrl: vi.fn(),
      delete: vi.fn(),
      list: vi.fn(),
    };
    sut = new UpdateProjectUseCase(projectsRepository, storageService);
  });

  it("deve atualizar dados do projeto", async () => {
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
      description: "Desc antiga",
      slug: "projeto-alpha",
      clientId,
      createdBy: userId,
      organizationId,
    });

    const updated = await sut.execute({
      id: project.id,
      userId,
      organizationId,
      name: "Projeto Alpha Renomeado",
      description: "Desc nova",
    });

    expect(updated.name).toBe("Projeto Alpha Renomeado");
    expect(updated.description).toBe("Desc nova");
  });

  it("não deve atualizar projeto inexistente", async () => {
    await expect(() =>
      sut.execute({
        id: randomUUID(),
        userId: randomUUID(),
        organizationId: randomUUID(),
        name: "X",
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });

  it("deve fazer upload de novos arquivos ao atualizar projeto", async () => {
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

    const file = new File(["conteudo"], "briefing.pdf", {
      type: "application/pdf",
    });

    const updated = await sut.execute({
      id: project.id,
      userId,
      organizationId,
      newFiles: [file],
    });

    expect(storageService.upload).toHaveBeenCalledWith(
      Buffer.from("pdf"),
      "projects/projeto-alpha/briefing.pdf",
      "application/pdf",
    );
    expect(prepareFileToUpload).toHaveBeenCalledWith({
      file: expect.objectContaining({ name: "briefing.pdf" }),
      folderName: "projects/projeto-alpha",
    });
    expect(projectsRepository.projectDocuments).toHaveLength(1);
    expect(projectsRepository.projectDocuments[0]?.name).toBe("briefing.pdf");
    expect(projectsRepository.projectDocuments[0]?.documentUrlReference).toBe(
      "projects/projeto-alpha/novo.pdf",
    );
  });

  it("deve atualizar projeto com datas estimadas informadas", async () => {
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

    const updated = await sut.execute({
      id: project.id,
      userId,
      organizationId,
      estimatedStartDate: new Date("2026-07-01"),
      endDate: new Date("2026-12-31"),
    });

    expect(updated.estimatedStartDate).toBeInstanceOf(Date);
    expect(updated.endDate).toBeInstanceOf(Date);
  });
});

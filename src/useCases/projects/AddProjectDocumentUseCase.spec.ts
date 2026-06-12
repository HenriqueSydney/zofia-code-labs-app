import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ResourceNotFoundError } from "../../errors/ResourceNotFoundError";
import { ValidationError } from "../../errors/ValidationError";
import { InMemoryProjectsRepository } from "../../repositories/in-memory/InMemoryProjectsRepository";
import type { IS3StorageService } from "../../services/s3Client/IS3StorageService";
import { AddProjectDocumentUseCase } from "./AddProjectDocumentUseCase";

vi.mock("../../lib/auth/checkUserPermissionForAsset", () => ({
  checkUserPermissionForAsset: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../../lib/auth/assertClientEmployeePermission", () => ({
  assertClientEmployeePermission: vi.fn().mockRejectedValue(new Error("not portal")),
}));

vi.mock("../../utils/prepareFileToUpload", () => ({
  prepareFileToUpload: vi.fn().mockResolvedValue({
    buffer: Buffer.from("conteudo"),
    key: "projects/projeto-alpha/anexo.pdf",
    mimeType: "application/pdf",
    originalName: "anexo.pdf",
    extension: "pdf",
  }),
}));

let projectsRepository: InMemoryProjectsRepository;
let storageService: IS3StorageService;
let sut: AddProjectDocumentUseCase;

function createTestFile(name: string, content = "conteudo") {
  const file = new File([content], name, { type: "application/pdf" });
  Object.defineProperty(file, "arrayBuffer", {
    value: async () => new TextEncoder().encode(content).buffer,
  });
  return file;
}

describe("AddProjectDocumentUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    projectsRepository = new InMemoryProjectsRepository();
    storageService = {
      getInstance: vi.fn(),
      getFileBuffer: vi.fn(),
      upload: vi.fn().mockResolvedValue({ key: "projects/projeto-alpha/anexo.pdf" }),
      getSignedUrl: vi.fn(),
      delete: vi.fn(),
      list: vi.fn(),
    };
    sut = new AddProjectDocumentUseCase(projectsRepository, storageService);
  });

  it("deve adicionar documentos ao projeto", async () => {
    const organizationId = randomUUID();
    const userId = randomUUID();
    const clientId = randomUUID();
    const file = createTestFile("anexo.pdf");

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

    await sut.execute({
      projectId: project.id,
      files: [file],
      userId,
    });

    expect(storageService.upload).toHaveBeenCalledTimes(1);
    expect(projectsRepository.projectDocuments).toHaveLength(1);
  });

  it("não deve adicionar documentos sem arquivos", async () => {
    await expect(() =>
      sut.execute({
        projectId: randomUUID(),
        files: [],
        userId: randomUUID(),
      }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it("não deve adicionar documentos em projeto inexistente", async () => {
    const file = createTestFile("anexo.pdf");

    await expect(() =>
      sut.execute({
        projectId: randomUUID(),
        files: [file],
        userId: randomUUID(),
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });

  it("deve adicionar documentos via permissão do portal do cliente", async () => {
    const { assertClientEmployeePermission } = await import(
      "../../lib/auth/assertClientEmployeePermission"
    );
    vi.mocked(assertClientEmployeePermission).mockResolvedValue(undefined);

    const organizationId = randomUUID();
    const userId = randomUUID();
    const clientId = randomUUID();
    const file = createTestFile("anexo.pdf");

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

    await sut.execute({
      projectId: project.id,
      files: [file],
      userId,
    });

    expect(assertClientEmployeePermission).toHaveBeenCalledWith(
      userId,
      clientId,
      "UPLOAD_DOCUMENT",
    );
    expect(projectsRepository.projectDocuments).toHaveLength(1);
  });

  it("deve usar projectId como pasta quando slug do projeto estiver vazio", async () => {
    const { prepareFileToUpload } = await import("../../utils/prepareFileToUpload");
    const { assertClientEmployeePermission } = await import(
      "../../lib/auth/assertClientEmployeePermission"
    );
    vi.mocked(assertClientEmployeePermission).mockRejectedValue(
      new Error("not portal"),
    );
    vi.mocked(prepareFileToUpload).mockImplementation(async ({ folderName, file }) => ({
      buffer: Buffer.from("conteudo"),
      key: `${folderName}/${file.name}`,
      mimeType: "application/pdf",
      originalName: file.name,
      extension: "pdf",
    }));

    const organizationId = randomUUID();
    const userId = randomUUID();
    const clientId = randomUUID();
    const file = createTestFile("anexo.pdf");

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

    const projectIndex = projectsRepository.items.findIndex(
      (item) => item.id === project.id,
    );
    projectsRepository.items[projectIndex].slug = "";

    vi.mocked(storageService.upload).mockImplementation(async (_buffer, key) => ({
      key,
    }));

    await sut.execute({
      projectId: project.id,
      files: [file],
      userId,
    });

    const expectedKey = `projects/${project.id}/anexo.pdf`;
    expect(storageService.upload).toHaveBeenCalledWith(
      expect.any(Buffer),
      expectedKey,
      "application/pdf",
    );
    expect(projectsRepository.projectDocuments[0]?.documentUrlReference).toBe(
      expectedKey,
    );
    expect(prepareFileToUpload).toHaveBeenCalledWith(
      expect.objectContaining({ folderName: `projects/${project.id}` }),
    );
  });
});

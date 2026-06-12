import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { InMemoryProjectsRepository } from "../../repositories/in-memory/InMemoryProjectsRepository";
import type { IS3StorageService } from "../../services/s3Client/IS3StorageService";
import { CreateProjectUseCase } from "./CreateProjectUseCase";

vi.mock("../../lib/auth/checkUserPermissionForAsset", () => ({
  checkUserPermissionForAsset: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../../lib/prisma", () => ({
  prisma: {
    $transaction: vi.fn((callback: (tx: unknown) => unknown) => callback({})),
  },
}));

vi.mock("../../utils/prepareFileToUpload", () => ({
  prepareFileToUpload: vi.fn().mockResolvedValue({
    buffer: Buffer.from("conteudo"),
    key: "projects/projeto-com-docs/briefing.pdf",
    mimeType: "application/pdf",
    originalName: "briefing.pdf",
    extension: "pdf",
  }),
}));

let projectsRepository: InMemoryProjectsRepository;
let storageService: IS3StorageService;
let sut: CreateProjectUseCase;

function createTestFile(name: string, content = "conteudo") {
  const file = new File([content], name, { type: "application/pdf" });
  Object.defineProperty(file, "arrayBuffer", {
    value: async () => new TextEncoder().encode(content).buffer,
  });
  return file;
}

describe("CreateProjectUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    projectsRepository = new InMemoryProjectsRepository();
    storageService = {
      getInstance: vi.fn(),
      getFileBuffer: vi.fn(),
      upload: vi.fn().mockResolvedValue({ key: "projects/novo-projeto/doc.pdf" }),
      getSignedUrl: vi.fn(),
      delete: vi.fn(),
      list: vi.fn(),
    };
    sut = new CreateProjectUseCase(projectsRepository, storageService);
  });

  it("deve criar projeto sem arquivos", async () => {
    const organizationId = randomUUID();
    const userId = randomUUID();
    const clientId = randomUUID();

    projectsRepository.clients.push({
      id: clientId,
      companyName: "Acme",
      slug: "acme",
      tradeName: "Acme",
    });

    const project = await sut.execute({
      name: "Novo Projeto",
      description: "Descrição",
      clientId,
      userId,
      organizationId,
      files: [],
    });

    expect(project.slug).toBe("novo-projeto");
    expect(projectsRepository.items).toHaveLength(1);
    expect(storageService.upload).not.toHaveBeenCalled();
  });

  it("deve criar projeto com upload de documentos", async () => {
    const organizationId = randomUUID();
    const userId = randomUUID();
    const clientId = randomUUID();
    const file = createTestFile("briefing.pdf");

    projectsRepository.clients.push({
      id: clientId,
      companyName: "Acme",
      slug: "acme",
      tradeName: "Acme",
    });

    await sut.execute({
      name: "Projeto Com Docs",
      description: "Com anexos",
      clientId,
      userId,
      organizationId,
      files: [file],
    });

    expect(storageService.upload).toHaveBeenCalledTimes(1);
    expect(projectsRepository.projectDocuments).toHaveLength(1);
  });

  it("deve criar projeto com datas estimadas informadas", async () => {
    const organizationId = randomUUID();
    const userId = randomUUID();
    const clientId = randomUUID();

    projectsRepository.clients.push({
      id: clientId,
      companyName: "Acme",
      slug: "acme",
      tradeName: "Acme",
    });

    const project = await sut.execute({
      name: "Projeto Datas",
      description: "Com cronograma",
      clientId,
      userId,
      organizationId,
      files: [],
      estimatedStartDate: new Date("2026-06-01"),
      endDate: new Date("2026-12-31"),
    });

    expect(project.estimatedStartDate).toBeInstanceOf(Date);
    expect(project.endDate).toBeInstanceOf(Date);
  });
});

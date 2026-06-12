import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ValidationError } from "../../errors/ValidationError";
import { InMemoryClientsRepository } from "../../repositories/in-memory/InMemoryClientsRepository";
import type { IS3StorageService } from "../../services/s3Client/IS3StorageService";
import { CreateClientUseCase } from "./CreateClientUseCase";

vi.mock("../../lib/auth/checkUserPermissionForAsset", () => ({
  checkUserPermissionForAsset: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../../utils/prepareFileToUpload", () => ({
  prepareFileToUpload: vi.fn().mockResolvedValue({
    buffer: Buffer.from("img"),
    key: "clientLogo/logo.png",
    mimeType: "image/png",
    originalName: "logo.png",
    extension: "png",
  }),
}));

let clientsRepository: InMemoryClientsRepository;
let storageService: IS3StorageService;
let sut: CreateClientUseCase;

describe("CreateClientUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clientsRepository = new InMemoryClientsRepository();
    storageService = {
      getInstance: vi.fn(),
      getFileBuffer: vi.fn(),
      upload: vi.fn().mockResolvedValue({ key: "clientLogo/logo-key" }),
      getSignedUrl: vi.fn(),
      delete: vi.fn(),
      list: vi.fn(),
    };
    sut = new CreateClientUseCase(clientsRepository, storageService);
  });

  it("deve criar cliente quando CNPJ não existe", async () => {
    const organizationId = randomUUID();
    const userId = randomUUID();

    const result = await sut.execute(
      {
        companyName: "Empresa LTDA",
        tradeName: "Empresa",
        cnpj: "12345678000199",
        email: "contato@empresa.com",
        phone: "11999999999",
        organizationId,
      },
      userId,
    );

    expect(result.slug).toBe("empresa");
    expect(result.cnpj).toBe("12345678000199");
    expect(clientsRepository.items).toHaveLength(1);
    expect(storageService.upload).not.toHaveBeenCalled();
  });

  it("não deve criar cliente com CNPJ duplicado", async () => {
    const organizationId = randomUUID();
    const payload = {
      companyName: "Empresa A",
      tradeName: "Empresa A",
      cnpj: "12345678000199",
      email: "a@empresa.com",
      phone: "11999999999",
      organizationId,
    };

    await sut.execute(payload, randomUUID());

    await expect(() => sut.execute(payload, randomUUID())).rejects.toBeInstanceOf(
      ValidationError,
    );
    expect(clientsRepository.items).toHaveLength(1);
  });

  it("deve fazer upload de logo quando arquivo for informado", async () => {
    const { prepareFileToUpload } = await import("../../utils/prepareFileToUpload");
    const organizationId = randomUUID();
    const userId = randomUUID();
    const file = new File(["logo"], "logo.png", { type: "image/png" });

    const result = await sut.execute(
      {
        companyName: "Empresa LTDA",
        tradeName: "Empresa",
        cnpj: "98765432000111",
        email: "contato@empresa.com",
        phone: "11999999999",
        organizationId,
        file,
      },
      userId,
    );

    expect(prepareFileToUpload).toHaveBeenCalledWith({
      file,
      folderName: "clientLogo",
    });
    expect(storageService.upload).toHaveBeenCalledWith(
      expect.any(Buffer),
      "clientLogo/logo.png",
      "image/png",
    );
    expect(result.logoReference).toBe("clientLogo/logo-key");
  });
});

import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ResourceNotFoundError } from "../../errors/ResourceNotFoundError";
import { InMemoryClientsRepository } from "../../repositories/in-memory/InMemoryClientsRepository";
import type { IS3StorageService } from "../../services/s3Client/IS3StorageService";
import { UpdateClientUseCase } from "./UpdateClientUseCase";

vi.mock("../../lib/auth/resolveClientAccess", () => ({
  assertClientAccessForUser: vi.fn().mockResolvedValue(undefined),
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
let sut: UpdateClientUseCase;

describe("UpdateClientUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clientsRepository = new InMemoryClientsRepository();
    storageService = {
      getInstance: vi.fn(),
      getFileBuffer: vi.fn(),
      upload: vi.fn().mockResolvedValue({ key: "clientLogo/logo.png" }),
      getSignedUrl: vi.fn(),
      delete: vi.fn(),
      list: vi.fn(),
    };
    sut = new UpdateClientUseCase(clientsRepository, storageService);
  });

  it("deve atualizar cliente existente", async () => {
    const organizationId = randomUUID();
    const userId = randomUUID();

    const client = await clientsRepository.create({
      organizationId,
      companyName: "Empresa LTDA",
      tradeName: "Empresa",
      slug: "empresa",
      cnpj: "12345678000199",
      email: "contato@empresa.com",
      phone: "11999999999",
    });

    const updated = await sut.execute({
      data: { id: client.id, tradeName: "Empresa Atualizada" },
      userId,
    });

    expect(updated.tradeName).toBe("Empresa Atualizada");
    expect(clientsRepository.items[0].tradeName).toBe("Empresa Atualizada");
  });

  it("não deve atualizar cliente inexistente", async () => {
    await expect(() =>
      sut.execute({
        data: { id: randomUUID(), tradeName: "X" },
        userId: randomUUID(),
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });

  it("deve fazer upload de logo ao atualizar cliente", async () => {
    const organizationId = randomUUID();
    const userId = randomUUID();

    const client = await clientsRepository.create({
      organizationId,
      companyName: "Empresa LTDA",
      tradeName: "Empresa",
      slug: "empresa",
      cnpj: "12345678000199",
      email: "contato@empresa.com",
      phone: "11999999999",
    });

    const file = new File(["img"], "logo.png", { type: "image/png" });

    const updated = await sut.execute({
      data: { id: client.id, file },
      userId,
    });

    expect(storageService.upload).toHaveBeenCalled();
    expect(updated.logoReference).toContain("clientLogo");
  });
});

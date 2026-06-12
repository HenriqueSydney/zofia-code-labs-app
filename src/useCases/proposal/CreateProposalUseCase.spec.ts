import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ValidationError } from "../../errors/ValidationError";
import { InMemoryAuditLogRepository } from "../../repositories/in-memory/InMemoryAuditLogRepository";
import { InMemoryProposalRepository } from "../../repositories/in-memory/InMemoryProposalRepository";
import { InMemoryServiceTypeRepository } from "../../repositories/in-memory/InMemoryServiceTypeRepository";
import type { IS3StorageService } from "../../services/s3Client/IS3StorageService";
import { CreateProposalUseCase } from "./CreateProposalUseCase";

vi.mock("../../lib/auth/checkUserPermissionForAsset", () => ({
  checkUserPermissionForAsset: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: vi.fn(
      async (callback: (tx: unknown) => Promise<unknown>) => callback({}),
    ),
  },
}));

let proposalRepository: InMemoryProposalRepository;
let serviceTypeRepository: InMemoryServiceTypeRepository;
let storageService: IS3StorageService;
let auditLogRepository: InMemoryAuditLogRepository;
let sut: CreateProposalUseCase;

describe("CreateProposalUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    proposalRepository = new InMemoryProposalRepository();
    serviceTypeRepository = new InMemoryServiceTypeRepository();
    auditLogRepository = new InMemoryAuditLogRepository();
    storageService = {
      getInstance: vi.fn(),
      getFileBuffer: vi.fn(),
      upload: vi.fn().mockResolvedValue({ key: "proposals/org/proposta.pdf" }),
      getSignedUrl: vi.fn(),
      delete: vi.fn(),
      list: vi.fn(),
    };

    sut = new CreateProposalUseCase(
      proposalRepository,
      serviceTypeRepository,
      storageService,
      auditLogRepository,
    );
  });

  it("deve lançar ValidationError sem arquivo", async () => {
    await expect(() =>
      sut.execute({
        projectId: randomUUID(),
        createdBy: randomUUID(),
        organizationId: randomUUID(),
        downPaymentPercentage: 30,
        items: [],
      }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it("deve criar proposta a partir de upload de arquivo", async () => {
    const organizationId = randomUUID();
    const projectId = randomUUID();
    const clientId = randomUUID();
    const userId = randomUUID();
    const serviceTypeId = randomUUID();

    proposalRepository.clients.push({
      id: clientId,
      tradeName: "Acme",
      email: "acme@test.com",
      slug: "acme",
    });
    proposalRepository.projects.push({
      id: projectId,
      slug: "projeto-alpha",
      organizationId,
      clientId,
    });

    serviceTypeRepository.items.push({
      id: serviceTypeId,
      organizationId,
      categoryId: randomUUID(),
      name: "Desenvolvimento",
      description: null,
      basePrice: 5000,
      estimatedDays: 30,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });

    const file = new File(["pdf"], "proposta-custom.pdf", {
      type: "application/pdf",
    });
    Object.defineProperty(file, "arrayBuffer", {
      value: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3]).buffer),
    });

    const proposal = await sut.execute({
      projectId,
      file,
      createdBy: userId,
      organizationId,
      downPaymentPercentage: 30,
      items: [
        {
          serviceTypeId,
          discount: 0,
          discountType: "PERCENTAGE",
        },
      ],
    });

    expect(proposal.projectId).toBe(projectId);
    expect(storageService.upload).toHaveBeenCalled();
    expect(auditLogRepository.items).toHaveLength(1);
  });

  it("deve usar preço zero quando serviço do item não for encontrado", async () => {
    const organizationId = randomUUID();
    const projectId = randomUUID();
    const clientId = randomUUID();
    const userId = randomUUID();
    const unknownServiceId = randomUUID();

    proposalRepository.clients.push({
      id: clientId,
      tradeName: "Acme",
      email: "acme@test.com",
      slug: "acme",
    });
    proposalRepository.projects.push({
      id: projectId,
      slug: "projeto-alpha",
      organizationId,
      clientId,
    });

    const file = new File(["pdf"], "proposta.pdf", { type: "application/pdf" });
    Object.defineProperty(file, "arrayBuffer", {
      value: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3]).buffer),
    });

    const proposal = await sut.execute({
      projectId,
      file,
      createdBy: userId,
      organizationId,
      downPaymentPercentage: 30,
      items: [
        {
          serviceTypeId: unknownServiceId,
          discount: 0,
          discountType: "PERCENTAGE",
        },
      ],
    });

    expect(proposal.totalValue.toNumber()).toBe(0);
    expect(proposalRepository.proposalItems[0].price.toNumber()).toBe(0);
  });

  it("deve usar extensão pdf quando nome do arquivo termina sem sufixo", async () => {
    const organizationId = randomUUID();
    const projectId = randomUUID();
    const clientId = randomUUID();
    const userId = randomUUID();
    const serviceTypeId = randomUUID();

    proposalRepository.clients.push({
      id: clientId,
      tradeName: "Acme",
      email: "acme@test.com",
      slug: "acme",
    });
    proposalRepository.projects.push({
      id: projectId,
      slug: "projeto-alpha",
      organizationId,
      clientId,
    });
    serviceTypeRepository.items.push({
      id: serviceTypeId,
      organizationId,
      categoryId: randomUUID(),
      name: "Desenvolvimento",
      description: null,
      basePrice: 1000,
      estimatedDays: 10,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });

    const file = new File(["pdf"], "proposta.", {
      type: "application/pdf",
    });
    Object.defineProperty(file, "arrayBuffer", {
      value: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3]).buffer),
    });

    await sut.execute({
      projectId,
      file,
      createdBy: userId,
      organizationId,
      downPaymentPercentage: 30,
      items: [
        {
          serviceTypeId,
          discount: 0,
          discountType: "PERCENTAGE",
        },
      ],
    });

    expect(storageService.upload).toHaveBeenCalledWith(
      expect.anything(),
      expect.stringMatching(/\.pdf$/),
      "application/pdf",
    );
  });
});

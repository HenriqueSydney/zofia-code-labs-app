import { randomUUID } from "node:crypto";
import { Decimal } from "@prisma/client/runtime/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ValidationError } from "../../errors/ValidationError";
import { date } from "../../lib/dayjs";
import { InMemoryAuditLogRepository } from "../../repositories/in-memory/InMemoryAuditLogRepository";
import { InMemoryContractRepository } from "../../repositories/in-memory/InMemoryContractRepository";
import { InMemoryProposalRepository } from "../../repositories/in-memory/InMemoryProposalRepository";
import type { IS3StorageService } from "../../services/s3Client/IS3StorageService";
import { CreateContractUseCase } from "./CreateContractUseCase";

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

let contractRepository: InMemoryContractRepository;
let proposalRepository: InMemoryProposalRepository;
let storageService: IS3StorageService;
let auditLogRepository: InMemoryAuditLogRepository;
let sut: CreateContractUseCase;

describe("CreateContractUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    contractRepository = new InMemoryContractRepository();
    proposalRepository = new InMemoryProposalRepository();
    auditLogRepository = new InMemoryAuditLogRepository();
    storageService = {
      getInstance: vi.fn(),
      getFileBuffer: vi.fn(),
      upload: vi.fn().mockResolvedValue({ key: "contracts/org/contrato.pdf" }),
      getSignedUrl: vi.fn(),
      delete: vi.fn(),
      list: vi.fn(),
    };

    sut = new CreateContractUseCase(
      contractRepository,
      proposalRepository,
      storageService,
      auditLogRepository,
    );
  });

  async function seedAcceptedProposal(projectId: string, userId: string) {
    const proposal = await proposalRepository.create({
      projectId,
      sourceType: "MANUAL_UPLOAD",
      totalValue: 10000,
      createdBy: userId,
      items: [],
    });

    const index = proposalRepository.items.findIndex(
      (item) => item.id === proposal.id,
    );
    proposalRepository.items[index] = {
      ...proposalRepository.items[index],
      status: "ACCEPTED",
      approvedAt: date().toDate(),
      approvedBy: userId,
    };

    return proposal;
  }

  function createPdfFile(name = "contrato.pdf") {
    const file = new File(["pdf"], name, { type: "application/pdf" });
    Object.defineProperty(file, "arrayBuffer", {
      value: async () => new TextEncoder().encode("pdf").buffer,
    });
    return file;
  }

  it("deve criar contrato com upload de arquivo", async () => {
    const organizationId = randomUUID();
    const projectId = randomUUID();
    const clientId = randomUUID();
    const userId = randomUUID();

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

    await seedAcceptedProposal(projectId, userId);

    const contract = await sut.execute({
      projectId,
      createdBy: userId,
      organizationId,
      file: createPdfFile(),
    });

    expect(contract.fileKey).toBe("contracts/org/contrato.pdf");
    expect(storageService.upload).toHaveBeenCalled();
    expect(auditLogRepository.items).toHaveLength(1);
  });

  it("deve lançar ValidationError sem arquivo", async () => {
    await expect(() =>
      sut.execute({
        projectId: randomUUID(),
        createdBy: randomUUID(),
        organizationId: randomUUID(),
      }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it("deve lançar ValidationError quando não há proposta aceita", async () => {
    const organizationId = randomUUID();
    const projectId = randomUUID();

    await expect(() =>
      sut.execute({
        projectId,
        createdBy: randomUUID(),
        organizationId,
        file: createPdfFile(),
      }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it("deve registrar entityId vazio no audit quando contrato não tem projectId", async () => {
    const organizationId = randomUUID();
    const projectId = randomUUID();
    const userId = randomUUID();

    proposalRepository.projects.push({
      id: projectId,
      slug: "projeto-alpha",
      organizationId,
      clientId: randomUUID(),
    });
    await seedAcceptedProposal(projectId, userId);

    const originalCreate = contractRepository.create.bind(contractRepository);
    vi.spyOn(contractRepository, "create").mockImplementation(async (data, tx) => {
      const contract = await originalCreate({ ...data, projectId: null as never }, tx);
      return contract;
    });

    await sut.execute({
      projectId,
      createdBy: userId,
      organizationId,
      file: createPdfFile(),
    });

    expect(contractRepository.items[0].projectId).toBeNull();
    expect(auditLogRepository.items[0]).toMatchObject({
      entityType: "Project",
      entityId: "",
      action: "CONTRACT_GENERATED",
      metadata: expect.objectContaining({ contractId: contractRepository.items[0].id }),
    });
  });
});

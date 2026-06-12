import { randomUUID } from "node:crypto";
import { Decimal } from "@prisma/client/runtime/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BusinessRuleError } from "../../errors/BusinessRuleError";
import { ResourceNotFoundError } from "../../errors/ResourceNotFoundError";
import { ValidationError } from "../../errors/ValidationError";
import { prisma } from "@/lib/prisma";
import { InMemoryAuditLogRepository } from "../../repositories/in-memory/InMemoryAuditLogRepository";
import { InMemoryContractRepository } from "../../repositories/in-memory/InMemoryContractRepository";
import { ChangeContractStatusUseCase } from "./ChangeContractStatusUseCase";
import type { ChangeProjectStatusUseCase } from "../projects/ChangeProjectStatusUseCase";
import type { ProvisionClientPortalOwnerUseCase } from "../clients/ProvisionClientPortalOwnerUseCase";
import type { IS3StorageService } from "../../services/s3Client/IS3StorageService";
import type { IDocumentSignService } from "../../services/documenso/IDocumentSignService";

vi.mock("../../lib/auth/checkUserPermissionForAsset", () => ({
  checkUserPermissionForAsset: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/contracts/contractReadyEmail", () => ({
  sendContractReadyEmailForContract: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: vi.fn(
      async (callback: (tx: unknown) => Promise<unknown>) =>
        callback({
          contract: { update: vi.fn().mockResolvedValue(undefined) },
        }),
    ),
    client: { findUnique: vi.fn() },
    contract: { update: vi.fn() },
  },
}));

let contractRepository: InMemoryContractRepository;
let auditLogRepository: InMemoryAuditLogRepository;
let changeProjectStatusUseCase: ChangeProjectStatusUseCase;
let provisionClientPortalOwnerUseCase: ProvisionClientPortalOwnerUseCase;
let storageService: IS3StorageService;
let documentSignService: IDocumentSignService;
let sut: ChangeContractStatusUseCase;

describe("ChangeContractStatusUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    contractRepository = new InMemoryContractRepository();
    auditLogRepository = new InMemoryAuditLogRepository();
    changeProjectStatusUseCase = {
      execute: vi.fn().mockResolvedValue(undefined),
    } as unknown as ChangeProjectStatusUseCase;
    provisionClientPortalOwnerUseCase = {
      execute: vi.fn().mockResolvedValue(undefined),
    } as unknown as ProvisionClientPortalOwnerUseCase;
    storageService = {
      getInstance: vi.fn(),
      getFileBuffer: vi.fn(),
      upload: vi.fn(),
      getSignedUrl: vi.fn(),
      delete: vi.fn(),
      list: vi.fn(),
    };
    documentSignService = {
      createDocument: vi.fn(),
      sendForSignature: vi.fn(),
    };

    sut = new ChangeContractStatusUseCase(
      contractRepository,
      changeProjectStatusUseCase,
      auditLogRepository,
      storageService,
      documentSignService,
      provisionClientPortalOwnerUseCase,
    );
  });

  it("deve alterar status de DRAFT para REVIEW", async () => {
    const organizationId = randomUUID();
    const projectId = randomUUID();
    const clientId = randomUUID();
    const proposalId = randomUUID();
    const userId = randomUUID();

    contractRepository.clients.push({
      id: clientId,
      tradeName: "Acme",
      email: "acme@test.com",
      slug: "acme",
    });
    contractRepository.projects.push({
      id: projectId,
      name: "Projeto Alpha",
      slug: "projeto-alpha",
      organizationId,
      clientId,
    });
    contractRepository.proposals.push({
      id: proposalId,
      totalValue: new Decimal(5000),
    });

    const contract = await contractRepository.create({
      proposalId,
      sourceType: "FROM_PROPOSAL",
      projectId,
      createdBy: userId,
      status: "DRAFT",
    });

    const result = await sut.execute({
      contractId: contract.id,
      newStatus: "REVIEW",
      userId,
    });

    expect(result.status).toBe("REVIEW");
    expect(auditLogRepository.items).toHaveLength(1);
  });

  it("deve lançar ResourceNotFoundError quando contrato não existe", async () => {
    await expect(() =>
      sut.execute({
        contractId: randomUUID(),
        newStatus: "REVIEW",
        userId: randomUUID(),
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });

  it("deve lançar BusinessRuleError para transição inválida", async () => {
    const organizationId = randomUUID();
    const projectId = randomUUID();
    const clientId = randomUUID();
    const proposalId = randomUUID();
    const userId = randomUUID();

    contractRepository.clients.push({
      id: clientId,
      tradeName: "Acme",
      email: "acme@test.com",
      slug: "acme",
    });
    contractRepository.projects.push({
      id: projectId,
      name: "Projeto Alpha",
      slug: "projeto-alpha",
      organizationId,
      clientId,
    });
    contractRepository.proposals.push({
      id: proposalId,
      totalValue: new Decimal(5000),
    });

    const contract = await contractRepository.create({
      proposalId,
      sourceType: "FROM_PROPOSAL",
      projectId,
      createdBy: userId,
      status: "SIGNED",
    });

    await expect(() =>
      sut.execute({
        contractId: contract.id,
        newStatus: "DRAFT",
        userId,
      }),
    ).rejects.toBeInstanceOf(BusinessRuleError);
  });

  it("deve enviar contrato para assinatura e email ao mudar para SENT", async () => {
    const organizationId = randomUUID();
    const projectId = randomUUID();
    const clientId = randomUUID();
    const proposalId = randomUUID();
    const userId = randomUUID();

    contractRepository.clients.push({
      id: clientId,
      tradeName: "Acme",
      email: "acme@test.com",
      slug: "acme",
      responsibleName: "João Silva",
      responsibleEmail: "joao@acme.com",
    });
    contractRepository.projects.push({
      id: projectId,
      name: "Projeto Alpha",
      slug: "projeto-alpha",
      organizationId,
      clientId,
    });
    contractRepository.proposals.push({
      id: proposalId,
      totalValue: new Decimal(5000),
    });

    const contract = await contractRepository.create({
      proposalId,
      sourceType: "FROM_PROPOSAL",
      projectId,
      createdBy: userId,
      status: "REVIEW",
      fileStorageKey: "contracts/contrato.pdf",
    });

    vi.mocked(prisma.client.findUnique).mockResolvedValue({
      id: clientId,
      tradeName: "Acme",
      companyName: "Acme LTDA",
      responsibleName: "João Silva",
      responsibleEmail: "joao@acme.com",
      organization: { name: "Zofia Code Labs" },
    } as never);
    vi.mocked(storageService.getFileBuffer).mockResolvedValue(
      Buffer.from("pdf-content"),
    );
    vi.mocked(documentSignService.createDocument).mockResolvedValue(999);
    vi.mocked(documentSignService.sendForSignature).mockResolvedValue(undefined);

    const { sendContractReadyEmailForContract } = await import(
      "@/lib/contracts/contractReadyEmail"
    );

    const result = await sut.execute({
      contractId: contract.id,
      newStatus: "SENT",
      userId,
      communicationChannel: "email",
    });

    expect(result.status).toBe("SENT");
    expect(documentSignService.createDocument).toHaveBeenCalled();
    expect(documentSignService.sendForSignature).toHaveBeenCalledWith(999);
    expect(provisionClientPortalOwnerUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        client: expect.objectContaining({ id: clientId }),
        projectId,
        inviterUserId: userId,
        organizationName: "Zofia Code Labs",
      }),
    );
    expect(sendContractReadyEmailForContract).toHaveBeenCalledWith(
      expect.objectContaining({
        id: contract.id,
        project: expect.objectContaining({
          name: "Projeto Alpha",
          client: expect.objectContaining({
            responsibleEmail: "joao@acme.com",
          }),
        }),
      }),
    );
    expect(changeProjectStatusUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({ newStatus: "WAITING_SIGNATURE" }),
      expect.anything(),
    );
  });

  it("deve registrar falha de email sem interromper envio", async () => {
    const organizationId = randomUUID();
    const projectId = randomUUID();
    const clientId = randomUUID();
    const proposalId = randomUUID();
    const userId = randomUUID();

    contractRepository.clients.push({
      id: clientId,
      tradeName: "Acme",
      email: "acme@test.com",
      slug: "acme",
      responsibleName: "João Silva",
      responsibleEmail: "joao@acme.com",
    });
    contractRepository.projects.push({
      id: projectId,
      name: "Projeto Alpha",
      slug: "projeto-alpha",
      organizationId,
      clientId,
    });
    contractRepository.proposals.push({
      id: proposalId,
      totalValue: new Decimal(5000),
    });

    const contract = await contractRepository.create({
      proposalId,
      sourceType: "FROM_PROPOSAL",
      projectId,
      createdBy: userId,
      status: "REVIEW",
      fileStorageKey: "contracts/contrato.pdf",
    });

    vi.mocked(prisma.client.findUnique).mockResolvedValue({
      id: clientId,
      tradeName: "Acme",
      responsibleName: "João Silva",
      responsibleEmail: "joao@acme.com",
      organization: { name: "Zofia Code Labs" },
    } as never);
    vi.mocked(storageService.getFileBuffer).mockResolvedValue(Buffer.from("pdf"));
    vi.mocked(documentSignService.createDocument).mockResolvedValue(888);
    vi.mocked(documentSignService.sendForSignature).mockResolvedValue(undefined);

    const { sendContractReadyEmailForContract } = await import(
      "@/lib/contracts/contractReadyEmail"
    );
    vi.mocked(sendContractReadyEmailForContract).mockRejectedValue(
      new Error("SMTP indisponível"),
    );

    const result = await sut.execute({
      contractId: contract.id,
      newStatus: "SENT",
      userId,
      communicationChannel: "email",
    });

    expect(result.status).toBe("SENT");
    expect(
      auditLogRepository.items.some((item) => item.action === "CONTRACT_EMAIL_FAILED"),
    ).toBe(true);
  });

  it("deve lançar ValidationError ao enviar contrato sem arquivo", async () => {
    const organizationId = randomUUID();
    const projectId = randomUUID();
    const clientId = randomUUID();
    const proposalId = randomUUID();
    const userId = randomUUID();

    contractRepository.clients.push({
      id: clientId,
      tradeName: "Acme",
      email: "acme@test.com",
      slug: "acme",
    });
    contractRepository.projects.push({
      id: projectId,
      name: "Projeto Alpha",
      slug: "projeto-alpha",
      organizationId,
      clientId,
    });
    contractRepository.proposals.push({
      id: proposalId,
      totalValue: new Decimal(5000),
    });

    const contract = await contractRepository.create({
      proposalId,
      sourceType: "FROM_PROPOSAL",
      projectId,
      createdBy: userId,
      status: "REVIEW",
    });

    await expect(() =>
      sut.execute({
        contractId: contract.id,
        newStatus: "SENT",
        userId,
      }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it("deve lançar ResourceNotFoundError quando cliente não existe ao enviar contrato", async () => {
    const organizationId = randomUUID();
    const projectId = randomUUID();
    const clientId = randomUUID();
    const proposalId = randomUUID();
    const userId = randomUUID();

    contractRepository.clients.push({
      id: clientId,
      tradeName: "Acme",
      email: "acme@test.com",
      slug: "acme",
    });
    contractRepository.projects.push({
      id: projectId,
      name: "Projeto Alpha",
      slug: "projeto-alpha",
      organizationId,
      clientId,
    });
    contractRepository.proposals.push({
      id: proposalId,
      totalValue: new Decimal(5000),
    });

    const contract = await contractRepository.create({
      proposalId,
      sourceType: "FROM_PROPOSAL",
      projectId,
      createdBy: userId,
      status: "REVIEW",
      fileStorageKey: "contracts/contrato.pdf",
    });

    vi.mocked(prisma.client.findUnique).mockResolvedValue(null);

    await expect(() =>
      sut.execute({
        contractId: contract.id,
        newStatus: "SENT",
        userId,
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });

  it("deve atualizar projeto para WAITING_DOWN_PAYMENT quando contrato assinado", async () => {
    const organizationId = randomUUID();
    const projectId = randomUUID();
    const clientId = randomUUID();
    const proposalId = randomUUID();
    const userId = randomUUID();

    contractRepository.clients.push({
      id: clientId,
      tradeName: "Acme",
      email: "acme@test.com",
      slug: "acme",
    });
    contractRepository.projects.push({
      id: projectId,
      name: "Projeto Alpha",
      slug: "projeto-alpha",
      organizationId,
      clientId,
    });
    contractRepository.proposals.push({
      id: proposalId,
      totalValue: new Decimal(5000),
    });

    const contract = await contractRepository.create({
      proposalId,
      sourceType: "FROM_PROPOSAL",
      projectId,
      createdBy: userId,
      status: "SIGNED",
    });

    const result = await sut.execute({
      contractId: contract.id,
      newStatus: "SIGNED",
      userId,
    });

    expect(result.status).toBe("SIGNED");
    expect(changeProjectStatusUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({ newStatus: "WAITING_DOWN_PAYMENT" }),
      expect.anything(),
    );
  });

  it("deve reverter projeto ao cancelar contrato em revisão", async () => {
    const organizationId = randomUUID();
    const projectId = randomUUID();
    const clientId = randomUUID();
    const proposalId = randomUUID();
    const userId = randomUUID();

    contractRepository.clients.push({
      id: clientId,
      tradeName: "Acme",
      email: "acme@test.com",
      slug: "acme",
    });
    contractRepository.projects.push({
      id: projectId,
      name: "Projeto Alpha",
      slug: "projeto-alpha",
      organizationId,
      clientId,
    });
    contractRepository.proposals.push({
      id: proposalId,
      totalValue: new Decimal(5000),
    });

    const contract = await contractRepository.create({
      proposalId,
      sourceType: "FROM_PROPOSAL",
      projectId,
      createdBy: userId,
      status: "REVIEW",
    });

    const result = await sut.execute({
      contractId: contract.id,
      newStatus: "CANCELLED",
      userId,
    });

    expect(result.status).toBe("CANCELLED");
    expect(changeProjectStatusUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({ newStatus: "PROPOSAL_GENERATED" }),
      expect.anything(),
    );
  });
});

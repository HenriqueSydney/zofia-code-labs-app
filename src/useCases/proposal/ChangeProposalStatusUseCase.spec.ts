import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BusinessRuleError } from "../../errors/BusinessRuleError";
import { ResourceNotFoundError } from "../../errors/ResourceNotFoundError";
import { InMemoryAuditLogRepository } from "../../repositories/in-memory/InMemoryAuditLogRepository";
import { InMemoryProposalRepository } from "../../repositories/in-memory/InMemoryProposalRepository";
import { sendProposalToClient } from "@/email/send";
import type { IS3StorageService } from "@/services/s3Client/IS3StorageService";

import { ChangeProposalStatusUseCase } from "./ChangeProposalStatusUseCase";
import type { ChangeProjectStatusUseCase } from "../projects/ChangeProjectStatusUseCase";

vi.mock("../../lib/auth/checkUserPermissionForAsset", () => ({
  checkUserPermissionForAsset: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/email/send", () => ({
  sendProposalToClient: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: vi.fn(
      async (callback: (tx: unknown) => Promise<unknown>) => callback({}),
    ),
  },
}));

let proposalRepository: InMemoryProposalRepository;
let auditLogRepository: InMemoryAuditLogRepository;
let changeProjectStatusUseCase: ChangeProjectStatusUseCase;
let storageService: IS3StorageService;
let sut: ChangeProposalStatusUseCase;

describe("ChangeProposalStatusUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    proposalRepository = new InMemoryProposalRepository();
    auditLogRepository = new InMemoryAuditLogRepository();
    changeProjectStatusUseCase = {
      execute: vi.fn().mockResolvedValue(undefined),
    } as unknown as ChangeProjectStatusUseCase;
    storageService = {
      getFileBuffer: vi.fn(),
    } as unknown as IS3StorageService;
    sut = new ChangeProposalStatusUseCase(
      proposalRepository,
      changeProjectStatusUseCase,
      auditLogRepository,
      storageService,
    );
  });

  it("deve alterar status de DRAFT para REVIEW", async () => {
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

    const proposal = await proposalRepository.create({
      projectId,
      sourceType: "MANUAL",
      totalValue: 10000,
      createdBy: userId,
      items: [],
      status: "DRAFT",
    });

    const result = await sut.execute({
      proposalId: proposal.id,
      newStatus: "REVIEW",
      userId,
    });

    expect(result.status).toBe("REVIEW");
    expect(auditLogRepository.items).toHaveLength(1);
  });

  it("deve lançar ResourceNotFoundError quando proposta não existe", async () => {
    await expect(() =>
      sut.execute({
        proposalId: randomUUID(),
        newStatus: "REVIEW",
        userId: randomUUID(),
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });

  it("deve lançar BusinessRuleError para transição inválida", async () => {
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

    const proposal = await proposalRepository.create({
      projectId,
      sourceType: "MANUAL",
      totalValue: 10000,
      createdBy: userId,
      items: [],
      status: "CANCELLED",
    });

    await expect(() =>
      sut.execute({
        proposalId: proposal.id,
        newStatus: "DRAFT",
        userId,
      }),
    ).rejects.toMatchObject({
      name: "BusinessRuleError",
      message: "Não é possível alterar o status de CANCELLED para DRAFT.",
    });
  });

  it("deve aceitar proposta e atualizar status do projeto", async () => {
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

    const proposal = await proposalRepository.create({
      projectId,
      sourceType: "MANUAL",
      totalValue: 10000,
      createdBy: userId,
      items: [],
      status: "SENT",
    });

    const result = await sut.execute({
      proposalId: proposal.id,
      newStatus: "ACCEPTED",
      userId,
    });

    expect(result.status).toBe("ACCEPTED");
    expect(changeProjectStatusUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        newStatus: "PROPOSAL_GENERATED",
        projectId,
        data: { observation: "Proposta aceita pelo cliente." },
      }),
      expect.anything(),
    );
    expect(auditLogRepository.items[0].action).toBe("PROPOSAL_STATUS_CHANGE");
    expect(auditLogRepository.items[0].changes?.status?.to).toBe("ACCEPTED");
  });

  it("deve persistir rejeição com detalhes no audit log", async () => {
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

    const proposal = await proposalRepository.create({
      projectId,
      sourceType: "MANUAL",
      totalValue: 10000,
      createdBy: userId,
      items: [],
      status: "SENT",
    });

    const result = await sut.execute({
      proposalId: proposal.id,
      newStatus: "REJECTED",
      userId,
      rejectFormDetails: { reason: "Orçamento acima do limite" },
    });

    expect(result.status).toBe("REJECTED");
    expect(auditLogRepository.items[0].metadata).toMatchObject({
      proposalId: proposal.id,
      reason: "Orçamento acima do limite",
    });
    expect(changeProjectStatusUseCase.execute).not.toHaveBeenCalled();
  });

  it("deve permitir transição idempotente para o mesmo status", async () => {
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

    const proposal = await proposalRepository.create({
      projectId,
      sourceType: "MANUAL",
      totalValue: 10000,
      createdBy: userId,
      items: [],
      status: "REVIEW",
    });

    const result = await sut.execute({
      proposalId: proposal.id,
      newStatus: "REVIEW",
      userId,
    });

    expect(result.status).toBe("REVIEW");
    expect(changeProjectStatusUseCase.execute).not.toHaveBeenCalled();
  });

  it("deve enviar proposta sem exigir canal de comunicação", async () => {
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

    const proposal = await proposalRepository.create({
      projectId,
      sourceType: "MANUAL",
      totalValue: 10000,
      createdBy: userId,
      items: [],
      status: "APPROVED",
    });

    const result = await sut.execute({
      proposalId: proposal.id,
      newStatus: "SENT",
      userId,
    });

    expect(result.status).toBe("SENT");
    expect(auditLogRepository.items[0]).toMatchObject({
      action: "PROPOSAL_STATUS_CHANGE",
      entityId: projectId,
      changes: { status: { to: "SENT" } },
      metadata: { proposalId: proposal.id },
    });
    expect(changeProjectStatusUseCase.execute).not.toHaveBeenCalled();
  });

  it("deve lançar BusinessRuleError para status de origem desconhecido", async () => {
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

    const proposal = await proposalRepository.create({
      projectId,
      sourceType: "MANUAL",
      totalValue: 10000,
      createdBy: userId,
      items: [],
      status: "DRAFT",
    });

    const proposalIndex = proposalRepository.items.findIndex(
      (item) => item.id === proposal.id,
    );
    proposalRepository.items[proposalIndex].status = "UNKNOWN" as never;

    await expect(() =>
      sut.execute({
        proposalId: proposal.id,
        newStatus: "REVIEW",
        userId,
      }),
    ).rejects.toMatchObject({
      name: "BusinessRuleError",
      message: "Não é possível alterar o status de UNKNOWN para REVIEW.",
    });
  });

  it("deve registrar entityId vazio no audit quando proposta não tem projectId", async () => {
    const organizationId = randomUUID();
    const clientId = randomUUID();
    const userId = randomUUID();

    proposalRepository.clients.push({
      id: clientId,
      tradeName: "Acme",
      email: "acme@test.com",
      slug: "acme",
    });
    proposalRepository.projects.push({
      id: randomUUID(),
      slug: "projeto-alpha",
      organizationId,
      clientId,
    });

    const proposal = await proposalRepository.create({
      projectId: null as never,
      sourceType: "MANUAL",
      totalValue: 10000,
      createdBy: userId,
      items: [],
      status: "DRAFT",
    });

    await sut.execute({
      proposalId: proposal.id,
      newStatus: "REVIEW",
      userId,
    });

    expect(auditLogRepository.items[0]).toMatchObject({
      entityType: "Project",
      entityId: "",
      action: "PROPOSAL_STATUS_CHANGE",
      metadata: { proposalId: proposal.id },
      changes: { status: { to: "REVIEW" } },
    });
  });
});

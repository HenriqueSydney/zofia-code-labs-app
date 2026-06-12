import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ResourceNotFoundError } from "../../errors/ResourceNotFoundError";
import { InMemoryAuditLogRepository } from "../../repositories/in-memory/InMemoryAuditLogRepository";
import { InMemoryProposalRepository } from "../../repositories/in-memory/InMemoryProposalRepository";
import { CancelProposalUseCase } from "./CancelProposalUseCase";

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
let auditLogRepository: InMemoryAuditLogRepository;
let sut: CancelProposalUseCase;

describe("CancelProposalUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    proposalRepository = new InMemoryProposalRepository();
    auditLogRepository = new InMemoryAuditLogRepository();
    sut = new CancelProposalUseCase(proposalRepository, auditLogRepository);
  });

  it("deve cancelar proposta existente", async () => {
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
    });

    const result = await sut.execute({ id: proposal.id, userId });

    expect(result.clientSlug).toBe("acme");
    expect(result.projectSlug).toBe("projeto-alpha");
    expect(proposalRepository.items[0].status).toBe("CANCELLED");
    expect(auditLogRepository.items).toHaveLength(1);
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
    });

    await sut.execute({ id: proposal.id, userId });

    expect(auditLogRepository.items[0]).toMatchObject({
      entityType: "Project",
      entityId: "",
      action: "PROPOSAL_STATUS_CHANGE",
      metadata: { proposalId: proposal.id },
      changes: { status: { from: "DRAFT", to: "CANCELLED" } },
    });
    expect(proposalRepository.items[0].status).toBe("CANCELLED");
  });

  it("deve lançar ResourceNotFoundError quando proposta não existe", async () => {
    await expect(() =>
      sut.execute({ id: randomUUID(), userId: randomUUID() }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });
});

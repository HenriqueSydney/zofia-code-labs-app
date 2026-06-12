import { randomUUID } from "node:crypto";
import { Decimal } from "@prisma/client/runtime/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ResourceNotFoundError } from "../../errors/ResourceNotFoundError";
import { InMemoryAuditLogRepository } from "../../repositories/in-memory/InMemoryAuditLogRepository";
import { InMemoryProposalRepository } from "../../repositories/in-memory/InMemoryProposalRepository";
import { UpdateProposalUseCase } from "./UpdateProposalUseCase";

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
let sut: UpdateProposalUseCase;

describe("UpdateProposalUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    proposalRepository = new InMemoryProposalRepository();
    auditLogRepository = new InMemoryAuditLogRepository();
    sut = new UpdateProposalUseCase(proposalRepository, auditLogRepository);
  });

  it("deve atualizar proposta sem alterar itens", async () => {
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

    const result = await sut.execute(proposal.id, {
      status: "REVIEW",
      userId,
      organizationId,
    });

    expect(result?.status).toBe("REVIEW");
    expect(auditLogRepository.items).toHaveLength(1);
  });

  it("deve atualizar proposta com novos itens e recalcular total", async () => {
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
    proposalRepository.serviceTypes.push({
      id: serviceTypeId,
      name: "Desenvolvimento",
    });

    const proposal = await proposalRepository.create({
      projectId,
      sourceType: "MANUAL",
      totalValue: 10000,
      createdBy: userId,
      items: [],
    });

    const result = await sut.execute(proposal.id, {
      userId,
      organizationId,
      items: [
        {
          serviceTypeId,
          price: 5000,
          discount: 0,
          discountType: "PERCENTAGE",
          finalPrice: 5000,
        },
      ],
    });

    expect(result?.totalValue).toEqual(new Decimal(5000));
    expect(proposalRepository.proposalItems).toHaveLength(1);
    expect(auditLogRepository.items).toHaveLength(1);
  });

  it("deve lançar ResourceNotFoundError quando proposta não existe", async () => {
    await expect(() =>
      sut.execute(randomUUID(), {
        userId: randomUUID(),
        organizationId: randomUUID(),
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
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

    await sut.execute(proposal.id, {
      userId,
      organizationId,
      status: "REVIEW",
    });

    expect(auditLogRepository.items[0]).toMatchObject({
      entityType: "Project",
      entityId: "",
      action: "PROPOSAL_UPDATED",
      metadata: { proposalId: proposal.id },
      changes: { status: { from: "DRAFT", to: "REVIEW" } },
    });
  });

  it("deve registrar entityId vazio no audit ao atualizar itens sem projectId", async () => {
    const organizationId = randomUUID();
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
      id: randomUUID(),
      slug: "projeto-alpha",
      organizationId,
      clientId,
    });
    proposalRepository.serviceTypes.push({
      id: serviceTypeId,
      name: "Desenvolvimento",
    });

    const proposal = await proposalRepository.create({
      projectId: null as never,
      sourceType: "MANUAL",
      totalValue: 10000,
      createdBy: userId,
      items: [],
    });

    const result = await sut.execute(proposal.id, {
      userId,
      organizationId,
      items: [
        {
          serviceTypeId,
          price: 5000,
          discount: 0,
          discountType: "PERCENTAGE",
          finalPrice: 5000,
        },
      ],
    });

    expect(result?.totalValue).toEqual(new Decimal(5000));
    expect(proposalRepository.proposalItems).toHaveLength(1);
    expect(auditLogRepository.items[0]).toMatchObject({
      entityType: "Project",
      entityId: "",
      action: "PROPOSAL_UPDATED",
      metadata: { proposalId: proposal.id },
    });
  });
});

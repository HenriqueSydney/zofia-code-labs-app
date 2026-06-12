import { randomUUID } from "node:crypto";
import { Decimal } from "@prisma/client/runtime/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ResourceNotFoundError } from "../../errors/ResourceNotFoundError";
import { InMemoryAuditLogRepository } from "../../repositories/in-memory/InMemoryAuditLogRepository";
import { InMemoryContractRepository } from "../../repositories/in-memory/InMemoryContractRepository";
import { UpdateContractUseCase } from "./UpdateContractUseCase";

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
let auditLogRepository: InMemoryAuditLogRepository;
let sut: UpdateContractUseCase;

describe("UpdateContractUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    contractRepository = new InMemoryContractRepository();
    auditLogRepository = new InMemoryAuditLogRepository();
    sut = new UpdateContractUseCase(contractRepository, auditLogRepository);
  });

  it("deve atualizar contrato existente", async () => {
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
    });

    const result = await sut.execute(contract.id, {
      status: "REVIEW",
      userId,
      organizationId,
    });

    expect(result.status).toBe("REVIEW");
    expect(auditLogRepository.items).toHaveLength(1);
  });

  it("deve manter status atual no audit log quando update não informar status", async () => {
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
    });

    await sut.execute(contract.id, {
      userId,
      organizationId,
    });

    expect(auditLogRepository.items[0].changes?.status).toEqual({
      from: contract.status,
      to: contract.status,
    });
  });

  it("deve registrar entityId vazio no audit quando contrato não tem projectId", async () => {
    const organizationId = randomUUID();
    const proposalId = randomUUID();
    const userId = randomUUID();

    contractRepository.proposals.push({
      id: proposalId,
      totalValue: new Decimal(5000),
    });

    const contract = await contractRepository.create({
      proposalId,
      sourceType: "FROM_PROPOSAL",
      projectId: null as never,
      createdBy: userId,
    });

    await sut.execute(contract.id, {
      status: "REVIEW",
      userId,
      organizationId,
    });

    expect(auditLogRepository.items[0].entityId).toBe("");
  });

  it("deve lançar ResourceNotFoundError quando contrato não existe", async () => {
    await expect(() =>
      sut.execute(randomUUID(), {
        userId: randomUUID(),
        organizationId: randomUUID(),
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });
});

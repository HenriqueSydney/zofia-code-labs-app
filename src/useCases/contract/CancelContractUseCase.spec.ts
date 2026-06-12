import { randomUUID } from "node:crypto";
import { Decimal } from "@prisma/client/runtime/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BusinessRuleError } from "../../errors/BusinessRuleError";
import { ResourceNotFoundError } from "../../errors/ResourceNotFoundError";
import { InMemoryAuditLogRepository } from "../../repositories/in-memory/InMemoryAuditLogRepository";
import { InMemoryContractRepository } from "../../repositories/in-memory/InMemoryContractRepository";
import { CancelContractUseCase } from "./CancelContractUseCase";
import type { ChangeProjectStatusUseCase } from "../projects/ChangeProjectStatusUseCase";
import type { IDocumentSignService } from "../../services/documenso/IDocumentSignService";

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
let changeProjectStatusUseCase: ChangeProjectStatusUseCase;
let documentSignService: IDocumentSignService;
let sut: CancelContractUseCase;

async function seedDraftContract(
  status: "DRAFT" | "SIGNED" | "CANCELLED" | "SENT" = "DRAFT",
  externalSignId: string | null = null,
) {
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
    status,
  });

  if (externalSignId) {
    contractRepository.items[0] = {
      ...contractRepository.items[0],
      externalSignId,
    };
  }

  return { contract, userId };
}

describe("CancelContractUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    contractRepository = new InMemoryContractRepository();
    auditLogRepository = new InMemoryAuditLogRepository();
    changeProjectStatusUseCase = {
      execute: vi.fn().mockResolvedValue(undefined),
    } as unknown as ChangeProjectStatusUseCase;
    documentSignService = {
      cancelDocument: vi.fn().mockResolvedValue(undefined),
    } as unknown as IDocumentSignService;
    sut = new CancelContractUseCase(
      contractRepository,
      auditLogRepository,
      changeProjectStatusUseCase,
      documentSignService,
    );
  });

  it("deve cancelar contrato em rascunho", async () => {
    const { contract, userId } = await seedDraftContract("DRAFT");

    const result = await sut.execute({ id: contract.id, userId });

    expect(result.slug).toBe("projeto-alpha");
    expect(result.clientSlug).toBe("acme");
    expect(contractRepository.items[0].status).toBe("CANCELLED");
    expect(auditLogRepository.items).toHaveLength(1);
    expect(documentSignService.cancelDocument).not.toHaveBeenCalled();
    expect(changeProjectStatusUseCase.execute).not.toHaveBeenCalled();
  });

  it("deve cancelar contrato enviado e reverter status do projeto", async () => {
    const externalSignId = "doc-123";
    const { contract, userId } = await seedDraftContract("SENT", externalSignId);

    const result = await sut.execute({ id: contract.id, userId });

    expect(result.slug).toBe("projeto-alpha");
    expect(contractRepository.items[0].status).toBe("CANCELLED");
    expect(documentSignService.cancelDocument).toHaveBeenCalledWith(
      externalSignId,
    );
    expect(changeProjectStatusUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        projectId: contract.projectId,
        newStatus: "PROPOSAL_GENERATED",
        userId,
      }),
      expect.anything(),
    );
    expect(auditLogRepository.items).toHaveLength(1);
  });

  it("deve lançar ResourceNotFoundError quando contrato não existe", async () => {
    await expect(() =>
      sut.execute({ id: randomUUID(), userId: randomUUID() }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });

  it("não deve cancelar contrato assinado", async () => {
    const { contract, userId } = await seedDraftContract("SIGNED");

    await expect(() =>
      sut.execute({ id: contract.id, userId }),
    ).rejects.toBeInstanceOf(BusinessRuleError);
  });

  it("não deve cancelar contrato já cancelado", async () => {
    const { contract, userId } = await seedDraftContract("CANCELLED");

    await expect(() =>
      sut.execute({ id: contract.id, userId }),
    ).rejects.toBeInstanceOf(BusinessRuleError);
  });

  it("deve registrar entityId vazio no audit ao cancelar contrato sem projectId", async () => {
    const { contract, userId } = await seedDraftContract("DRAFT");
    contractRepository.items[0] = {
      ...contractRepository.items[0],
      projectId: null as never,
    };

    await sut.execute({ id: contract.id, userId });

    expect(auditLogRepository.items[0]).toMatchObject({
      entityType: "Project",
      entityId: "",
      action: "CONTRACT_STATUS_CHANGE",
      metadata: { contractId: contract.id },
      changes: { status: { from: "DRAFT", to: "CANCELLED" } },
    });
    expect(contractRepository.items[0].status).toBe("CANCELLED");
  });
});

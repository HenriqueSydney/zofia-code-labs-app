import { randomUUID } from "node:crypto";
import { Decimal } from "@prisma/client/runtime/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { InMemoryContractRepository } from "../../repositories/in-memory/InMemoryContractRepository";
import { ListAllContractsUseCase } from "./ListAllContractsUseCase";

vi.mock("../../lib/auth/checkUserPermissionForAsset", () => ({
  checkUserPermissionForAsset: vi.fn().mockResolvedValue(undefined),
}));

let contractRepository: InMemoryContractRepository;
let sut: ListAllContractsUseCase;

describe("ListAllContractsUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    contractRepository = new InMemoryContractRepository();
    sut = new ListAllContractsUseCase(contractRepository);
  });

  it("deve listar contratos da organização", async () => {
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

    await contractRepository.create({
      proposalId,
      sourceType: "FROM_PROPOSAL",
      projectId,
      createdBy: userId,
    });

    const result = await sut.execute({ organizationId, userId });

    expect(result.contracts).toHaveLength(1);
    expect(result.totalOfRegister).toBe(1);
  });
});

import { randomUUID } from "node:crypto";
import { Decimal } from "@prisma/client/runtime/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ResourceNotFoundError } from "../../errors/ResourceNotFoundError";
import { InMemoryContractRepository } from "../../repositories/in-memory/InMemoryContractRepository";
import { GetContractByIdUseCase } from "./GetContractByIdUseCase";

vi.mock("../../lib/auth/checkUserPermissionForAsset", () => ({
  checkUserPermissionForAsset: vi.fn().mockResolvedValue(undefined),
}));

let contractRepository: InMemoryContractRepository;
let sut: GetContractByIdUseCase;

describe("GetContractByIdUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    contractRepository = new InMemoryContractRepository();
    sut = new GetContractByIdUseCase(contractRepository);
  });

  it("deve retornar contrato quando id existe", async () => {
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

    const result = await sut.execute({ id: contract.id, userId });

    expect(result.id).toBe(contract.id);
    expect(result.project.organizationId).toBe(organizationId);
  });

  it("deve lançar ResourceNotFoundError quando contrato não existe", async () => {
    await expect(() =>
      sut.execute({ id: randomUUID(), userId: randomUUID() }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });
});

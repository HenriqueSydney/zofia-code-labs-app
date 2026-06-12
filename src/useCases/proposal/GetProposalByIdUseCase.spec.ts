import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ResourceNotFoundError } from "../../errors/ResourceNotFoundError";
import { InMemoryProposalRepository } from "../../repositories/in-memory/InMemoryProposalRepository";
import { GetProposalByIdUseCase } from "./GetProposalByIdUseCase";

vi.mock("../../lib/auth/checkUserPermissionForAsset", () => ({
  checkUserPermissionForAsset: vi.fn().mockResolvedValue(undefined),
}));

let proposalRepository: InMemoryProposalRepository;
let sut: GetProposalByIdUseCase;

describe("GetProposalByIdUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    proposalRepository = new InMemoryProposalRepository();
    sut = new GetProposalByIdUseCase(proposalRepository);
  });

  it("deve retornar proposta quando id existe", async () => {
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

    expect(result.id).toBe(proposal.id);
    expect(result.project.organizationId).toBe(organizationId);
  });

  it("deve lançar ResourceNotFoundError quando proposta não existe", async () => {
    await expect(() =>
      sut.execute({ id: randomUUID(), userId: randomUUID() }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });
});

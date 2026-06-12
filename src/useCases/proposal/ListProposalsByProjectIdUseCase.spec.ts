import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { InMemoryProposalRepository } from "../../repositories/in-memory/InMemoryProposalRepository";
import { ListProposalsByProjectIdUseCase } from "./ListProposalsByProjectIdUseCase";

vi.mock("../../lib/auth/checkUserPermissionForAsset", () => ({
  checkUserPermissionForAsset: vi.fn().mockResolvedValue(undefined),
}));

let proposalRepository: InMemoryProposalRepository;
let sut: ListProposalsByProjectIdUseCase;

describe("ListProposalsByProjectIdUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    proposalRepository = new InMemoryProposalRepository();
    sut = new ListProposalsByProjectIdUseCase(proposalRepository);
  });

  it("deve listar propostas do projeto", async () => {
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

    await proposalRepository.create({
      projectId,
      sourceType: "MANUAL",
      totalValue: 10000,
      createdBy: userId,
      items: [],
    });

    const result = await sut.execute({
      projectId,
      userId,
      organizationId,
    });

    expect(result).toHaveLength(1);
  });
});

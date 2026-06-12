import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { InMemoryProposalRepository } from "../../repositories/in-memory/InMemoryProposalRepository";
import { ListProposalsByClientIdUseCase } from "./ListProposalsByClientIdUseCase";

vi.mock("../../lib/auth/checkUserPermissionForAsset", () => ({
  checkUserPermissionForAsset: vi.fn().mockResolvedValue(undefined),
}));

let proposalRepository: InMemoryProposalRepository;
let sut: ListProposalsByClientIdUseCase;

describe("ListProposalsByClientIdUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    proposalRepository = new InMemoryProposalRepository();
    sut = new ListProposalsByClientIdUseCase(proposalRepository);
  });

  it("deve listar propostas do cliente", async () => {
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
      clientId,
      userId,
      organizationId,
    });

    expect(result).toHaveLength(1);
  });
});

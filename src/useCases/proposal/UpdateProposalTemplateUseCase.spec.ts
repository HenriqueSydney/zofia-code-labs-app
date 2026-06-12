import { randomUUID } from "node:crypto";
import { Decimal } from "@prisma/client/runtime/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ResourceNotFoundError } from "../../errors/ResourceNotFoundError";
import { ValidationError } from "../../errors/ValidationError";
import { InMemoryProposalRepository } from "../../repositories/in-memory/InMemoryProposalRepository";
import { InMemoryProposalTemplateRepository } from "../../repositories/in-memory/InMemoryProposalTemplateRepository";
import { UpdateProposalTemplateUseCase } from "./UpdateProposalTemplateUseCase";

vi.mock("../../lib/auth/checkUserPermissionForAsset", () => ({
  checkUserPermissionForAsset: vi.fn().mockResolvedValue(undefined),
}));

let proposalRepository: InMemoryProposalRepository;
let proposalTemplateRepository: InMemoryProposalTemplateRepository;
let sut: UpdateProposalTemplateUseCase;

describe("UpdateProposalTemplateUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    proposalRepository = new InMemoryProposalRepository();
    proposalTemplateRepository = new InMemoryProposalTemplateRepository();
    sut = new UpdateProposalTemplateUseCase(
      proposalRepository,
      proposalTemplateRepository,
    );
  });

  it("deve atualizar template da proposta", async () => {
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
      sourceType: "MANUAL_UPLOAD",
      totalValue: 10000,
      createdBy: userId,
      items: [],
    });

    const template = await proposalTemplateRepository.create({
      proposalId: proposal.id,
      content: { body: "conteúdo antigo" },
    });

    vi.spyOn(proposalRepository, "findById").mockResolvedValue({
      ...proposal,
      items: [],
      proposalTemplate: template,
      project: {
        slug: "projeto-alpha",
        organizationId,
        client: {
          tradeName: "Acme",
          email: "acme@test.com",
          slug: "acme",
        },
      },
      createdUser: { name: "Admin" },
      approvedUser: null,
      reviewUser: null,
    });

    const newContent = { body: "conteúdo novo" };
    const result = await sut.execute({
      proposalId: proposal.id,
      newContent,
      organizationId,
      userId,
    });

    expect(result.slug).toBe("projeto-alpha");
    expect(result.clientSlug).toBe("acme");
    expect(proposalTemplateRepository.items[0].content).toEqual(newContent);
  });

  it("deve lançar ResourceNotFoundError quando proposta não existe", async () => {
    await expect(() =>
      sut.execute({
        proposalId: randomUUID(),
        newContent: {},
        organizationId: randomUUID(),
        userId: randomUUID(),
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });

  it("deve lançar ValidationError quando proposta não possui template", async () => {
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
      sourceType: "MANUAL_UPLOAD",
      totalValue: 10000,
      createdBy: userId,
      items: [],
    });

    await expect(() =>
      sut.execute({
        proposalId: proposal.id,
        newContent: {},
        organizationId,
        userId,
      }),
    ).rejects.toBeInstanceOf(ValidationError);
  });
});

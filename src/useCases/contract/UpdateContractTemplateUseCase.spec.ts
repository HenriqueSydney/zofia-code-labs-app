import { randomUUID } from "node:crypto";
import { Decimal } from "@prisma/client/runtime/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ResourceNotFoundError } from "../../errors/ResourceNotFoundError";
import { ValidationError } from "../../errors/ValidationError";
import { InMemoryContractRepository } from "../../repositories/in-memory/InMemoryContractRepository";
import { InMemoryContractTemplateRepository } from "../../repositories/in-memory/InMemoryContractTemplateRepository";
import { UpdateContractTemplateUseCase } from "./UpdateContractTemplateUseCase";

vi.mock("../../lib/auth/checkUserPermissionForAsset", () => ({
  checkUserPermissionForAsset: vi.fn().mockResolvedValue(undefined),
}));

let contractRepository: InMemoryContractRepository;
let contractTemplateRepository: InMemoryContractTemplateRepository;
let sut: UpdateContractTemplateUseCase;

describe("UpdateContractTemplateUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    contractRepository = new InMemoryContractRepository();
    contractTemplateRepository = new InMemoryContractTemplateRepository();
    sut = new UpdateContractTemplateUseCase(
      contractRepository,
      contractTemplateRepository,
    );
  });

  it("deve atualizar template do contrato", async () => {
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

    const template = await contractTemplateRepository.create({
      contractId: contract.id,
      content: { body: "conteúdo antigo" },
    });

    contractRepository.contractTemplateByContractId[contract.id] = {
      id: template.id,
      content: { body: "conteúdo antigo" },
    };

    const newContent = { body: "conteúdo novo" };
    const result = await sut.execute({
      contractId: contract.id,
      newContent,
      organizationId,
      userId,
    });

    expect(result.slug).toBe("projeto-alpha");
    expect(contractTemplateRepository.items[0].content).toEqual(newContent);
  });

  it("deve lançar ResourceNotFoundError quando contrato não existe", async () => {
    await expect(() =>
      sut.execute({
        contractId: randomUUID(),
        newContent: {},
        organizationId: randomUUID(),
        userId: randomUUID(),
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });

  it("deve lançar ValidationError quando contrato não possui template", async () => {
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

    await expect(() =>
      sut.execute({
        contractId: contract.id,
        newContent: {},
        organizationId,
        userId,
      }),
    ).rejects.toBeInstanceOf(ValidationError);
  });
});

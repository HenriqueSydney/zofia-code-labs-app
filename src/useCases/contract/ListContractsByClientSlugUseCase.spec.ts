import { randomUUID } from "node:crypto";
import { Decimal } from "@prisma/client/runtime/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ResourceNotFoundError } from "../../errors/ResourceNotFoundError";
import { InMemoryClientsRepository } from "../../repositories/in-memory/InMemoryClientsRepository";
import { InMemoryContractRepository } from "../../repositories/in-memory/InMemoryContractRepository";
import { ListContractsByClientSlugUseCase } from "./ListContractsByClientSlugUseCase";

vi.mock("../../lib/auth/checkUserPermissionForAsset", () => ({
  checkUserPermissionForAsset: vi.fn().mockResolvedValue(undefined),
}));

let clientsRepository: InMemoryClientsRepository;
let contractRepository: InMemoryContractRepository;
let sut: ListContractsByClientSlugUseCase;

describe("ListContractsByClientSlugUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clientsRepository = new InMemoryClientsRepository();
    contractRepository = new InMemoryContractRepository();
    sut = new ListContractsByClientSlugUseCase(
      clientsRepository,
      contractRepository,
    );
  });

  it("deve listar contratos do cliente pelo slug", async () => {
    const organizationId = randomUUID();
    const userId = randomUUID();

    const client = await clientsRepository.create({
      companyName: "Empresa LTDA",
      tradeName: "Empresa",
      cnpj: "12345678000199",
      email: "contato@empresa.com",
      phone: "11999999999",
      organizationId,
    });

    const projectId = randomUUID();
    const proposalId = randomUUID();

    contractRepository.clients.push({
      id: client.id,
      tradeName: client.tradeName,
      email: client.email,
      slug: client.slug,
    });
    contractRepository.projects.push({
      id: projectId,
      name: "Projeto Alpha",
      slug: "projeto-alpha",
      organizationId,
      clientId: client.id,
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

    const result = await sut.execute({
      clientSlug: client.slug,
      userId,
      organizationId,
    });

    expect(result.contracts).toHaveLength(1);
  });

  it("deve lançar ResourceNotFoundError quando cliente não existe", async () => {
    await expect(() =>
      sut.execute({
        clientSlug: "inexistente",
        userId: randomUUID(),
        organizationId: randomUUID(),
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });
});

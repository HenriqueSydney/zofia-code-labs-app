import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { InMemoryClientsRepository } from "../../repositories/in-memory/InMemoryClientsRepository";
import { FetchClientUseCase } from "./FetchClientUseCase";

vi.mock("../../lib/auth/checkUserPermissionForAsset", () => ({
  checkUserPermissionForAsset: vi.fn().mockResolvedValue(undefined),
}));

let clientsRepository: InMemoryClientsRepository;
let sut: FetchClientUseCase;

describe("FetchClientUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clientsRepository = new InMemoryClientsRepository();
    sut = new FetchClientUseCase(clientsRepository);
  });

  it("deve listar clientes da organização", async () => {
    const organizationId = randomUUID();
    const userId = randomUUID();

    await clientsRepository.create({
      organizationId,
      companyName: "Empresa A LTDA",
      tradeName: "Empresa A",
      slug: "empresa-a",
      cnpj: "12345678000199",
      email: "a@empresa.com",
      phone: "11999999999",
    });

    await clientsRepository.create({
      organizationId,
      companyName: "Empresa B LTDA",
      tradeName: "Empresa B",
      slug: "empresa-b",
      cnpj: "98765432000188",
      email: "b@empresa.com",
      phone: "11888888888",
    });

    const result = await sut.execute({ organizationId, userId });

    expect(result.clients).toHaveLength(2);
  });

  it("deve filtrar clientes por query", async () => {
    const organizationId = randomUUID();
    const userId = randomUUID();

    await clientsRepository.create({
      organizationId,
      companyName: "Alpha LTDA",
      tradeName: "Alpha",
      slug: "alpha",
      cnpj: "11111111000111",
      email: "alpha@empresa.com",
      phone: "11999999999",
    });

    await clientsRepository.create({
      organizationId,
      companyName: "Beta LTDA",
      tradeName: "Beta",
      slug: "beta",
      cnpj: "22222222000222",
      email: "beta@empresa.com",
      phone: "11888888888",
    });

    const result = await sut.execute({
      organizationId,
      userId,
      query: "Alpha",
    });

    expect(result.clients).toHaveLength(1);
    expect(result.clients[0].tradeName).toBe("Alpha");
  });
});

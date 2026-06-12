import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ResourceNotFoundError } from "../../errors/ResourceNotFoundError";
import { InMemoryClientsRepository } from "../../repositories/in-memory/InMemoryClientsRepository";
import { GetClientDeliveryEvolutionUseCase } from "./GetClientDeliveryEvolutionUseCase";

vi.mock("../../lib/auth/resolveClientAccess", () => ({
  assertClientAccessForUser: vi.fn().mockResolvedValue(undefined),
}));

let clientsRepository: InMemoryClientsRepository;
let sut: GetClientDeliveryEvolutionUseCase;

describe("GetClientDeliveryEvolutionUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clientsRepository = new InMemoryClientsRepository();
    sut = new GetClientDeliveryEvolutionUseCase(clientsRepository);
  });

  it("deve retornar evolução de entrega do cliente existente", async () => {
    const organizationId = randomUUID();
    const userId = randomUUID();

    await clientsRepository.create({
      organizationId,
      companyName: "Empresa LTDA",
      tradeName: "Empresa",
      slug: "empresa",
      cnpj: "12345678000199",
      email: "contato@empresa.com",
      phone: "11999999999",
    });

    const result = await sut.execute({ slug: "empresa", userId });

    expect(result.deliveryEvolution).toEqual([]);
  });

  it("não deve retornar evolução de cliente inexistente", async () => {
    await expect(() =>
      sut.execute({ slug: "inexistente", userId: randomUUID() }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });
});

import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ResourceNotFoundError } from "../../errors/ResourceNotFoundError";
import { assertClientAccessForUser } from "../../lib/auth/resolveClientAccess";
import { InMemoryClientsRepository } from "../../repositories/in-memory/InMemoryClientsRepository";
import { GetClientBlockersUseCase } from "./GetClientBlockersUseCase";

vi.mock("../../lib/auth/resolveClientAccess", () => ({
  assertClientAccessForUser: vi.fn().mockResolvedValue(undefined),
}));

let clientsRepository: InMemoryClientsRepository;
let sut: GetClientBlockersUseCase;

describe("GetClientBlockersUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(assertClientAccessForUser).mockResolvedValue(undefined);
    clientsRepository = new InMemoryClientsRepository();
    sut = new GetClientBlockersUseCase(clientsRepository);
  });

  it("deve retornar blockers do cliente existente", async () => {
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

    expect(result.blockerItens).toEqual([]);
    expect(assertClientAccessForUser).toHaveBeenCalled();
  });

  it("não deve retornar blockers de cliente inexistente", async () => {
    await expect(() =>
      sut.execute({ slug: "inexistente", userId: randomUUID() }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });
});

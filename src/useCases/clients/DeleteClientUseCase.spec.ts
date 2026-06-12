import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ResourceNotFoundError } from "../../errors/ResourceNotFoundError";
import { InMemoryClientsRepository } from "../../repositories/in-memory/InMemoryClientsRepository";
import { DeleteClientUseCase } from "./DeleteClientUseCase";

vi.mock("../../lib/auth/resolveClientAccess", () => ({
  assertClientAccessForUser: vi.fn().mockResolvedValue(undefined),
}));

let clientsRepository: InMemoryClientsRepository;
let sut: DeleteClientUseCase;

describe("DeleteClientUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clientsRepository = new InMemoryClientsRepository();
    sut = new DeleteClientUseCase(clientsRepository);
  });

  it("deve remover cliente existente", async () => {
    const organizationId = randomUUID();
    const userId = randomUUID();

    const client = await clientsRepository.create({
      organizationId,
      companyName: "Empresa LTDA",
      tradeName: "Empresa",
      slug: "empresa",
      cnpj: "12345678000199",
      email: "contato@empresa.com",
      phone: "11999999999",
    });

    await sut.execute({ id: client.id, userId });

    expect(clientsRepository.items[0].deletedAt).not.toBeNull();
  });

  it("não deve remover cliente inexistente", async () => {
    const userId = randomUUID();

    await expect(() =>
      sut.execute({ id: randomUUID(), userId }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });
});

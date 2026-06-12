import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ResourceNotFoundError } from "../../errors/ResourceNotFoundError";
import { InMemoryOrganizationsRepository } from "../../repositories/in-memory/InMemoryOrganizationsRepository";
import { GetOrganizationUseCase } from "./GetOrganizationUseCase";

vi.mock("../../lib/auth/checkUserPermissionForAsset", () => ({
  checkUserPermissionForAsset: vi.fn().mockResolvedValue(undefined),
}));

let organizationsRepository: InMemoryOrganizationsRepository;
let sut: GetOrganizationUseCase;

describe("GetOrganizationUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    organizationsRepository = new InMemoryOrganizationsRepository();
    sut = new GetOrganizationUseCase(organizationsRepository);
  });

  it("deve retornar organização por id", async () => {
    const userId = randomUUID();
    const organization = await organizationsRepository.create({
      name: "Zofia Labs",
      slug: "zofia-labs",
      cnpj: "12345678000199",
    });

    const result = await sut.execute({
      identifier: organization.id,
      identifierType: "id",
      userId,
    });

    expect(result.organization.id).toBe(organization.id);
    expect(result.organization.name).toBe("Zofia Labs");
  });

  it("deve retornar organização por slug", async () => {
    const userId = randomUUID();
    await organizationsRepository.create({
      name: "Zofia Labs",
      slug: "zofia-labs",
    });

    const result = await sut.execute({
      identifier: "zofia-labs",
      identifierType: "slug",
      userId,
    });

    expect(result.organization.slug).toBe("zofia-labs");
  });

  it("deve retornar organização por cnpj", async () => {
    const userId = randomUUID();
    await organizationsRepository.create({
      name: "Zofia Labs",
      slug: "zofia-labs",
      cnpj: "98765432000111",
    });

    const result = await sut.execute({
      identifier: "98765432000111",
      identifierType: "cnpj",
      userId,
    });

    expect(result.organization.cnpj).toBe("98765432000111");
  });

  it("não deve retornar organização inexistente", async () => {
    await expect(() =>
      sut.execute({
        identifier: randomUUID(),
        identifierType: "id",
        userId: randomUUID(),
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });

  it("deve lançar ValidationError para tipo de identificador inválido", async () => {
    await expect(() =>
      sut.execute({
        identifier: "x",
        identifierType: "invalid" as never,
        userId: randomUUID(),
      }),
    ).rejects.toMatchObject({ name: "ValidationError" });
  });
});
